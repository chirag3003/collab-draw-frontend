"use client";

import { useProjectSubscription, useUpdateProject } from "@/lib/hooks/project";
import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { use, useCallback, useEffect, useRef } from "react";

function debounceUpdate(
  delay = 500,
  fn: (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
  ) => void,
) {
  let timeoutId: NodeJS.Timeout;
  return (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(elements, appState);
    }, delay);
  };
}

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

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  // const { data: projectData, loading } = useProjectByID(id);
  const { data: projectData, loading } = useProjectSubscription(id);
  const [updateProject] = useUpdateProject();
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const isUpdatingFromSubscription = useRef(false);
  let initialData:
    | { appState: AppState; elements: OrderedExcalidrawElement[] }
    | undefined;
  if (projectData?.project) {
    if (projectData.project.appState && projectData.project.elements) {
      const parsedAppState = JSON.parse(projectData.project.appState);
      const parsedElements = JSON.parse(projectData.project.elements);

      // Ensure collaborators is always an array
      if (
        !parsedAppState.collaborators ||
        !Array.isArray(parsedAppState.collaborators)
      ) {
        parsedAppState.collaborators = [];
      }

      initialData = {
        appState: parsedAppState,
        elements: parsedElements,
      };
    }
  }

  // Update Excalidraw scene when subscription data changes
  useEffect(() => {
    if (
      excalidrawAPIRef.current &&
      projectData?.project?.appState &&
      projectData?.project?.elements
    ) {
      try {
        isUpdatingFromSubscription.current = true;
        const parsedAppState = JSON.parse(projectData.project.appState);
        const parsedElements = JSON.parse(projectData.project.elements);

        // Ensure collaborators is always an array
        if (
          !parsedAppState.collaborators ||
          !Array.isArray(parsedAppState.collaborators)
        ) {
          parsedAppState.collaborators = [];
        }

        // Set flag to prevent onChange from triggering during this update

        // Update the scene with new data
        excalidrawAPIRef.current.updateScene({
          elements: parsedElements,
          appState: parsedAppState,
        });
      } catch (error) {
        console.error("Error updating Excalidraw scene:", error);
        isUpdatingFromSubscription.current = false;
      }
    }
  }, [projectData?.project?.appState, projectData?.project?.elements]);

  const onUpdate = useCallback(
    debounceUpdate(
      100,
      (elements: readonly OrderedExcalidrawElement[], appState: AppState) => {
        if(isUpdatingFromSubscription.current) {
          isUpdatingFromSubscription.current = false;
          return;
        }
        console.log("triggering update");
        const appStateString = JSON.stringify(appState);
        const elementsString = JSON.stringify(elements);

        updateProject({
          variables: {
            ID: id,
            appState: appStateString,
            elements: elementsString,
            socketID: projectData?.project.socketID || "",
          },
        });
      },
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function onChange(
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
  ) {
    // Only trigger updates if it's not from a subscription update
    // if (!isUpdatingFromSubscription.current) {
    onUpdate(elements, appState);
    // }
  }

  if (!loading && !projectData?.project) {
    location.replace("/app");
  }

  return (
    <div className="w-full h-full">
      {!loading && (
        <Excalidraw
          excalidrawAPI={(api) => {
            excalidrawAPIRef.current = api;
          }}
          // isCollaborating={true}
          
          initialData={initialData}
          onChange={(elements, appState) => onChange(elements, appState)}
          UIOptions={{
            canvasActions: {
              toggleTheme: true,
              saveToActiveFile: false,
              // loadScene: false,
              export: {
                saveFileToDisk: true,
              },
            },
          }}
        />
      )}
    </div>
  );
}
