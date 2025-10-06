"use client";

import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useProjectSubscription } from "@/lib/hooks/project";
import { getApolloClient } from "@/lib/apolloClient";
import { gql } from "@apollo/client";

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
}

export default function Project({ projectID }: ProjectProps) {
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const excalidrawAPIUpdateRef = useRef<boolean>(false);
  const [initialSet, setInitialSet] = useState<boolean>(false);
  const excalidrawElementsRef = useRef<string>(null);

  const { data: subscriptionData, loading: subscriptionLoading } =
    useProjectSubscription(projectID, !excalidrawApi);
  // const [updateProject] = useUpdateProject();

  const onChange = useCallback(
    async (elements: readonly OrderedExcalidrawElement[]) => {
      if (!excalidrawAPIUpdateRef.current) {
        console.log("Elements changed:", elements);
        if (subscriptionData?.project.socketID) {
          if (!initialSet) {
            console.log("Initial set not done yet, skipping update.");
            return;
          }
          const elementsString = JSON.stringify(elements);
          if (elementsString === excalidrawElementsRef.current) {
            console.log("Elements match subscription data, skipping update.");
            return;
          }
          excalidrawElementsRef.current = elementsString;
          getApolloClient().mutate({
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
        }
      } else {
        console.log("Change originated from subscription, not updating.");
        excalidrawAPIUpdateRef.current = false;
      }
    },
    [
      initialSet,
      subscriptionData?.project.socketID,
      projectID,
      // updateProject,
    ],
  );

  useEffect(() => {
    if (
      excalidrawApi &&
      subscriptionData?.project.elements &&
      !subscriptionLoading
    ) {
      excalidrawAPIUpdateRef.current = true;
      console.log("Updating scene from subscription data.");
      excalidrawElementsRef.current = subscriptionData.project.elements;
      excalidrawApi.updateScene({
        elements: JSON.parse(subscriptionData.project.elements),
      });
      setInitialSet(true);
    }
  }, [subscriptionData?.project.elements, excalidrawApi, subscriptionLoading]);
  return (
    <div className="w-full h-full">
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
