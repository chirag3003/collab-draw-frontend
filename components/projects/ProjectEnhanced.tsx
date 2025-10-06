/**
 * ENHANCED VERSION: Project component with additional optimizations
 * 
 * This is a drop-in replacement for Project.tsx with:
 * - Connection status indicator
 * - Adaptive throttling based on scene complexity
 * - Better error recovery
 * - Performance metrics logging
 * 
 * To use: Rename this file to Project.tsx (backup the original first)
 */

"use client";

import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useProjectSubscription } from "@/lib/hooks/project";
import { getApolloClient } from "@/lib/apolloClient";
import { gql } from "@apollo/client";

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
}

// Connection status component
function ConnectionStatus({ status }: { status: "connected" | "disconnected" | "syncing" }) {
  const statusConfig = {
    connected: { color: "bg-green-500", text: "Connected" },
    syncing: { color: "bg-yellow-500", text: "Syncing..." },
    disconnected: { color: "bg-red-500", text: "Disconnected" },
  };

  const config = statusConfig[status];

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-gray-200">
      <div className={`w-2 h-2 rounded-full ${config.color} ${status === "syncing" ? "animate-pulse" : ""}`} />
      <span className="text-sm font-medium text-gray-700">{config.text}</span>
    </div>
  );
}

// Performance metrics component (dev mode only)
function PerformanceMetrics({ metrics }: { metrics: {
  mutations: number;
  avgPayloadSize: number;
  elementCount: number;
}}) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="absolute bottom-4 left-4 z-50 bg-black/80 backdrop-blur text-white px-3 py-2 rounded-lg shadow-lg font-mono text-xs space-y-1">
      <div>Updates/sec: {metrics.mutations}</div>
      <div>Payload: {(metrics.avgPayloadSize / 1024).toFixed(1)}KB</div>
      <div>Elements: {metrics.elementCount}</div>
    </div>
  );
}

// Smart merge function
function mergeElements(
  current: readonly OrderedExcalidrawElement[],
  incoming: readonly OrderedExcalidrawElement[],
  lastSynced: readonly OrderedExcalidrawElement[],
): OrderedExcalidrawElement[] {
  if (lastSynced.length === 0) {
    return [...incoming];
  }

  const currentMap = new Map(current.map(el => [el.id, el]));
  const incomingMap = new Map(incoming.map(el => [el.id, el]));
  const lastSyncedMap = new Map(lastSynced.map(el => [el.id, el]));

  const merged: OrderedExcalidrawElement[] = [];

  for (const incomingEl of incoming) {
    const currentEl = currentMap.get(incomingEl.id);
    const lastSyncedEl = lastSyncedMap.get(incomingEl.id);

    if (currentEl && lastSyncedEl && currentEl.version > lastSyncedEl.version) {
      merged.push(currentEl.version >= incomingEl.version ? currentEl : incomingEl);
    } else {
      merged.push(incomingEl);
    }
  }

  for (const currentEl of current) {
    if (!incomingMap.has(currentEl.id)) {
      const lastSyncedEl = lastSyncedMap.get(currentEl.id);
      if (!lastSyncedEl) {
        merged.push(currentEl);
      }
    }
  }

  return merged;
}

export default function ProjectEnhanced({ projectID }: ProjectProps) {
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const isRemoteUpdateRef = useRef<boolean>(false);
  const [initialSet, setInitialSet] = useState<boolean>(false);
  const lastElementsHashRef = useRef<string>("");
  const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedElementsRef = useRef<readonly OrderedExcalidrawElement[]>([]);
  
  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "syncing">("connected");
  
  // Performance metrics (dev mode)
  const [metrics, setMetrics] = useState({ mutations: 0, avgPayloadSize: 0, elementCount: 0 });
  const mutationCountRef = useRef(0);
  const payloadSizesRef = useRef<number[]>([]);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } =
    useProjectSubscription(projectID, !excalidrawApi);

  // Monitor subscription errors and connection status
  useEffect(() => {
    if (subscriptionError) {
      console.error("Subscription error:", subscriptionError);
      setConnectionStatus("disconnected");
    } else if (subscriptionLoading) {
      setConnectionStatus("syncing");
    } else if (subscriptionData) {
      setConnectionStatus("connected");
      retryCountRef.current = 0; // Reset retry count on successful connection
    }
  }, [subscriptionError, subscriptionLoading, subscriptionData]);

  // Performance metrics tracker (dev mode)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const interval = setInterval(() => {
      const avgPayloadSize = payloadSizesRef.current.length > 0
        ? payloadSizesRef.current.reduce((a, b) => a + b, 0) / payloadSizesRef.current.length
        : 0;
      
      setMetrics({
        mutations: mutationCountRef.current,
        avgPayloadSize,
        elementCount: excalidrawApi?.getSceneElements().length || 0,
      });
      
      mutationCountRef.current = 0;
      payloadSizesRef.current = [];
    }, 1000);

    return () => clearInterval(interval);
  }, [excalidrawApi]);

  // Adaptive throttle delay based on element count
  const getThrottleDelay = useCallback((elementCount: number) => {
    if (elementCount < 50) return 100;
    if (elementCount < 200) return 200;
    if (elementCount < 500) return 300;
    return 500;
  }, []);

  const getElementsHash = useCallback((elements: readonly OrderedExcalidrawElement[]) => {
    const idVersionPairs = elements.map(el => `${el.id}:${el.version}`);
    return `${elements.length}:${idVersionPairs.join(',')}`;
  }, []);

  const sendUpdate = useCallback(
    (elements: readonly OrderedExcalidrawElement[]) => {
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }

      const delay = getThrottleDelay(elements.length);

      pendingUpdateRef.current = setTimeout(async () => {
        if (subscriptionData?.project.socketID) {
          setConnectionStatus("syncing");
          const elementsString = JSON.stringify(elements);
          
          // Track metrics
          if (process.env.NODE_ENV === "development") {
            mutationCountRef.current++;
            payloadSizesRef.current.push(elementsString.length);
          }

          try {
            await getApolloClient().mutate({
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
            });
            lastSyncedElementsRef.current = elements;
            setConnectionStatus("connected");
            retryCountRef.current = 0;
          } catch (error) {
            console.error("Failed to update project:", error);
            setConnectionStatus("disconnected");
            
            // Retry logic
            if (retryCountRef.current < MAX_RETRIES) {
              retryCountRef.current++;
              console.log(`Retrying update (${retryCountRef.current}/${MAX_RETRIES})...`);
              setTimeout(() => sendUpdate(elements), 1000 * retryCountRef.current);
            }
          }
        }
        pendingUpdateRef.current = null;
      }, delay);
    },
    [subscriptionData?.project.socketID, projectID, getThrottleDelay],
  );

  const onChange = useCallback(
    async (elements: readonly OrderedExcalidrawElement[]) => {
      if (isRemoteUpdateRef.current) {
        console.log("Change originated from subscription, not updating.");
        isRemoteUpdateRef.current = false;
        return;
      }

      if (!initialSet) {
        console.log("Initial set not done yet, skipping update.");
        return;
      }

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

  useEffect(() => {
    if (
      excalidrawApi &&
      subscriptionData?.project.elements &&
      !subscriptionLoading
    ) {
      try {
        const incomingElements = JSON.parse(subscriptionData.project.elements) as OrderedExcalidrawElement[];
        
        const incomingHash = getElementsHash(incomingElements);
        if (incomingHash === lastElementsHashRef.current) {
          console.log("Subscription data matches current state, skipping update.");
          if (!initialSet) setInitialSet(true);
          return;
        }

        isRemoteUpdateRef.current = true;
        console.log("Updating scene from subscription data.");
        
        const currentElements = excalidrawApi.getSceneElements();
        const mergedElements = mergeElements(currentElements, incomingElements, lastSyncedElementsRef.current);
        
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
  }, [subscriptionData?.project.elements, excalidrawApi, subscriptionLoading, initialSet, getElementsHash]);

  useEffect(() => {
    return () => {
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <ConnectionStatus status={connectionStatus} />
      <PerformanceMetrics metrics={metrics} />
      
      <Excalidraw
        excalidrawAPI={(api) => {
          setExcalidrawApi(api);
        }}
        onChange={(elements) => onChange(elements)}
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
