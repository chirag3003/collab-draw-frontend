"use client";

import { useProjectByID, useUpdateProject } from "@/lib/hooks/project";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { use, useCallback } from "react";

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
  const { data: projectData, loading } = useProjectByID(id);
  const [updateProject] = useUpdateProject();
  let initialData:
    | { appState: AppState; elements: OrderedExcalidrawElement[] }
    | undefined;
  if (projectData?.project) {
    if (projectData.project.appState && projectData.project.elements) {
      const parsedAppState = JSON.parse(projectData.project.appState);
      const parsedElements = JSON.parse(projectData.project.elements);
      
      // Ensure collaborators is always an array
      if (!parsedAppState.collaborators || !Array.isArray(parsedAppState.collaborators)) {
        parsedAppState.collaborators = [];
      }
      
      initialData = {
        appState: parsedAppState,
        elements: parsedElements,
      };
    }
  }

  console.log("initialData", initialData);

  const onUpdate = useCallback(
    debounceUpdate(
      500,
      (elements: readonly OrderedExcalidrawElement[], appState: AppState) => {
        updateProject({
          variables: {
            ID: id,
            appState: JSON.stringify(appState),
            elements: JSON.stringify(elements),
          },
        });
      },
    ),
    [],
  );

  function onChange(
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
  ) {
    onUpdate(elements, appState);
  }

  return (
    <div className="w-full h-full">
      {!loading && (
        <Excalidraw
          isCollaborating={false}
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
