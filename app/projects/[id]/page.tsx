"use client";

import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

function debounceUpdate(delay = 500) {
  let timeoutId: NodeJS.Timeout;
  return (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      console.log({
        elements,
        appState,
      });
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

export default function ProjectPage() {
  const [data, setData] = useState<
    | {
        appState: AppState;
        elements: OrderedExcalidrawElement[];
      }
    | undefined
  >(undefined);

  const onUpdate = useCallback(debounceUpdate(), []);

  function onChange(
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
  ) {
    onUpdate(elements, appState);
  }

  return (
    <div className="w-full h-full">
      <Excalidraw
        theme="light"
        isCollaborating={false}
        initialData={
          data && {
            appState: data?.appState,
            elements: data?.elements,
          }
        }
        onChange={(elements, appState) => onChange(elements, appState)}
      />
    </div>
  );
}
