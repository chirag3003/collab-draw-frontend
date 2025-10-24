"use client";

import { gql } from "@apollo/client";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { getApolloClient } from "@/lib/apolloClient";
import { useProjectSubscription } from "@/lib/hooks/project";

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drawing canvas...</p>
        </div>
      </div>
    ),
  },
);

interface ProjectProps {
  projectID: string;
  initialAppState: AppState;
}

// Smart merge function to handle concurrent edits
function mergeElements(
  current: readonly OrderedExcalidrawElement[],
  incoming: readonly OrderedExcalidrawElement[],
  lastSynced: readonly OrderedExcalidrawElement[],
): OrderedExcalidrawElement[] {
  // If this is the first sync, just use incoming
  if (lastSynced.length === 0) {
    return [...incoming];
  }

  // Create maps for efficient lookup
  const currentMap = new Map(current.map((el) => [el.id, el]));
  const incomingMap = new Map(incoming.map((el) => [el.id, el]));
  const lastSyncedMap = new Map(lastSynced.map((el) => [el.id, el]));

  const merged: OrderedExcalidrawElement[] = [];

  // Process all elements from incoming (remote changes)
  for (const incomingEl of incoming) {
    const currentEl = currentMap.get(incomingEl.id);
    const lastSyncedEl = lastSyncedMap.get(incomingEl.id);

    // If element exists locally and has been modified since last sync
    if (currentEl && lastSyncedEl && currentEl.version > lastSyncedEl.version) {
      // Keep the version with higher version number (last-write-wins)
      merged.push(
        currentEl.version >= incomingEl.version ? currentEl : incomingEl,
      );
    } else {
      // Use incoming element (no local changes or incoming is newer)
      merged.push(incomingEl);
    }
  }

  // Add any new local elements that don't exist in incoming
  for (const currentEl of current) {
    if (!incomingMap.has(currentEl.id)) {
      const lastSyncedEl = lastSyncedMap.get(currentEl.id);
      // Only add if it's truly new (not in last synced state)
      if (!lastSyncedEl) {
        merged.push(currentEl);
      }
    }
  }

  return merged;
}

export default function Project({ projectID, initialAppState }: ProjectProps) {
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const isRemoteUpdateRef = useRef<boolean>(false);
  const [initialSet, setInitialSet] = useState<boolean>(false);
  const lastElementsHashRef = useRef<string>("");
  const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedElementsRef = useRef<readonly OrderedExcalidrawElement[]>([]);

  const {
    data: subscriptionData,
    loading: subscriptionLoading,
    error: subscriptionError,
  } = useProjectSubscription(projectID, !excalidrawApi);

  // Optimized hash function using element IDs and versions
  const getElementsHash = useCallback(
    (elements: readonly OrderedExcalidrawElement[]) => {
      // Create a quick hash based on element count, IDs, and versions
      const idVersionPairs = elements.map((el) => `${el.id}:${el.version}`);
      return `${elements.length}:${idVersionPairs.join(",")}`;
    },
    [],
  );

  // Throttled update function - sends changes at most every 100ms
  const sendUpdate = useCallback(
    (elements: readonly OrderedExcalidrawElement[]) => {
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }

      pendingUpdateRef.current = setTimeout(() => {
        if (subscriptionData?.project.socketID) {
          const elementsString = JSON.stringify(elements);
          getApolloClient()
            .mutate({
              mutation: gql`
              mutation updateProject($ID:ID!, $elements:String!, $socketID:ID!) {
                updateProject(
                  id: $ID
                  elements: $elements
                  socketID: $socketID
                )
              }
            `,
              variables: {
                ID: projectID,
                elements: elementsString,
                socketID: subscriptionData?.project.socketID,
              },
            })
            .catch((error) => {
              console.error("Failed to update project:", error);
            });
          lastSyncedElementsRef.current = elements;
        }
        pendingUpdateRef.current = null;
      }, 100); // Throttle to 100ms
    },
    [subscriptionData?.project.socketID, projectID],
  );

  const onChange = useCallback(
    async (elements: readonly OrderedExcalidrawElement[]) => {
      // Skip if this is a remote update being applied
      if (isRemoteUpdateRef.current) {
        console.log("Change originated from subscription, not updating.");
        isRemoteUpdateRef.current = false;
        return;
      }

      // Skip if initial sync not done
      if (!initialSet) {
        console.log("Initial set not done yet, skipping update.");
        return;
      }

      // Fast hash comparison to avoid unnecessary updates
      const currentHash = getElementsHash(elements);
      if (currentHash === lastElementsHashRef.current) {
        return;
      }
      lastElementsHashRef.current = currentHash;

      console.log("Elements changed, throttled update scheduled");
      sendUpdate(elements);
    },
    [initialSet, getElementsHash, sendUpdate],
  );

  function setAppState(appState: AppState) {
    Cookies.set(`appState_${projectID}`, JSON.stringify(appState));
  }

  // Handle subscription updates with optimized scene merging
  useEffect(() => {
    if (
      excalidrawApi &&
      // subscriptionData?.project.elements &&
      !subscriptionLoading
    ) {
      try {
        let toParse = subscriptionData?.project.elements ?? "[]";
        if (toParse.trim() === "") toParse = "[]";
        const incomingElements = JSON.parse(
          toParse,
        ) as OrderedExcalidrawElement[];

        // Check if this is actually new data
        const incomingHash = getElementsHash(incomingElements);
        if (incomingHash === lastElementsHashRef.current) {
          console.log(
            "Subscription data matches current state, skipping update.",
          );
          if (!initialSet) setInitialSet(true);
          return;
        }

        isRemoteUpdateRef.current = true;
        console.log("Updating scene from subscription data.");

        // Smart merge: preserve local uncommitted changes if any
        const currentElements = excalidrawApi.getSceneElements();
        const mergedElements = mergeElements(
          currentElements,
          incomingElements,
          lastSyncedElementsRef.current,
        );

        lastElementsHashRef.current = getElementsHash(mergedElements);
        excalidrawApi.updateScene({
          elements: mergedElements,
        });
        lastSyncedElementsRef.current = incomingElements;
        setInitialSet(true);
      } catch (error) {
        console.error("Failed to update scene from subscription:", error);
        isRemoteUpdateRef.current = false;
      }
    }
  }, [
    subscriptionData?.project.elements,
    excalidrawApi,
    subscriptionLoading,
    initialSet,
    getElementsHash,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!subscriptionLoading && subscriptionError) {
      location.replace("/app");
      // console.log("No valid socketID, would redirect to /app");
    }
  }, [subscriptionLoading, subscriptionError]);
  return (
    <div className="w-full h-full">
      <Excalidraw
        initialData={{
          appState: initialAppState,
        }}

        excalidrawAPI={(api) => {
          setExcalidrawApi(api);
        }}
        onChange={(elements, appState) => {
          onChange(elements);
          setAppState(appState);
        }}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            saveToActiveFile: false,
            export: {
              saveFileToDisk: true,
            },
          },
        }}
      />
    </div>
  );
}
