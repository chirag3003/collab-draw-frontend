/**
 * OPTIONAL: Advanced optimizations for project hooks
 * 
 * This file contains optional improvements you can implement
 * for even better performance in multi-user scenarios.
 * 
 * NOTE: This file has intentional type errors because optional dependencies
 * are not installed. To use these optimizations:
 * 
 * 1. Install dependencies: bun add pako @types/pako idb
 * 2. Update your GraphQL backend to support these features
 * 3. Copy the functions you need to your project
 * 
 * DO NOT import this file directly - it's a reference implementation.
 */

import { gql } from "@apollo/client";
import { useSubscription, useMutation } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
// @ts-ignore - Optional dependency
import pako from "pako"; // Install: bun add pako @types/pako

/**
 * IMPROVEMENT 1: Subscription with echo prevention
 * Prevents receiving your own updates back from the server
 */
export const useProjectSubscriptionOptimized = (
  projectID: string,
  socketID: string | null,
  skip: boolean,
) => {
  const QUERY = gql`
    subscription GetProjectUpdates($ID: ID!, $excludeSocketID: ID) {
      project(id: $ID, excludeSocketID: $excludeSocketID) {
        elements
        compressed # New field: indicates if data is compressed
        delta # New field: only changed elements
        socketID
      }
    }
  `;

  return useSubscription<{
    project: {
      elements?: string;
      compressed?: boolean;
      delta?: string;
      socketID: string;
    };
  }>(QUERY, {
    variables: { 
      ID: projectID,
      excludeSocketID: socketID, // Don't send updates back to sender
    },
    skip: skip,
    shouldResubscribe: true,
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });
};

/**
 * IMPROVEMENT 2: Compressed mutation
 * Reduces payload size by 70-90%
 */
export const useUpdateProjectCompressed = () => {
  const QUERY = gql`
    mutation updateProjectCompressed(
      $ID: ID!
      $elements: String!
      $socketID: ID!
      $compressed: Boolean
    ) {
      updateProject(
        id: $ID
        elements: $elements
        socketID: $socketID
        compressed: $compressed
      )
    }
  `;

  const [mutate] = useMutation(QUERY);

  return (projectID: string, elements: string, socketID: string) => {
    try {
      // Compress data before sending
      const compressed = pako.gzip(elements);
      const base64 = btoa(String.fromCharCode(...compressed));

      return mutate({
        variables: {
          ID: projectID,
          elements: base64,
          socketID: socketID,
          compressed: true,
        },
      });
    } catch (error) {
      console.error("Compression failed, sending uncompressed:", error);
      // Fallback to uncompressed
      return mutate({
        variables: {
          ID: projectID,
          elements: elements,
          socketID: socketID,
          compressed: false,
        },
      });
    }
  };
};

/**
 * IMPROVEMENT 3: Delta-based updates
 * Only send changed elements instead of entire scene
 */
export interface ElementDelta {
  id: string;
  action: "create" | "update" | "delete";
  element?: unknown;
  version: number;
}

export const useUpdateProjectDelta = () => {
  const QUERY = gql`
    mutation updateProjectDelta(
      $ID: ID!
      $deltas: [ElementDeltaInput!]!
      $socketID: ID!
    ) {
      updateProjectDelta(id: $ID, deltas: $deltas, socketID: $socketID)
    }
  `;

  return useMutation(QUERY);
};

/**
 * IMPROVEMENT 4: Adaptive throttling
 * Adjusts update frequency based on scene complexity
 */
export const useAdaptiveThrottle = (elementCount: number) => {
  // More elements = longer throttle delay
  const getDelay = () => {
    if (elementCount < 50) return 100;
    if (elementCount < 200) return 200;
    if (elementCount < 500) return 300;
    return 500;
  };

  return { delay: getDelay() };
};

/**
 * IMPROVEMENT 5: Connection quality monitoring
 * Adjusts behavior based on network conditions
 */
export const useConnectionQuality = () => {
  const [quality, setQuality] = useState<"good" | "fair" | "poor">("good");
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    // Measure round-trip time periodically
    const measureLatency = async () => {
      const start = Date.now();
      try {
        await fetch("/api/ping", { method: "HEAD" });
        const rtt = Date.now() - start;
        setLatency(rtt);

        if (rtt < 100) setQuality("good");
        else if (rtt < 300) setQuality("fair");
        else setQuality("poor");
      } catch {
        setQuality("poor");
      }
    };

    const interval = setInterval(measureLatency, 5000);
    measureLatency();

    return () => clearInterval(interval);
  }, []);

  return { quality, latency };
};

/**
 * IMPROVEMENT 6: User presence tracking
 * Show active users and their cursor positions
 */
export const useProjectPresence = (projectID: string, userID: string) => {
  const SUBSCRIPTION = gql`
    subscription GetPresence($projectID: ID!) {
      presence(projectID: $projectID) {
        userId
        userName
        cursor {
          x
          y
        }
        color
        lastActive
      }
    }
  `;

  const UPDATE_PRESENCE = gql`
    mutation UpdatePresence(
      $projectID: ID!
      $userId: ID!
      $cursor: CursorInput
    ) {
      updatePresence(projectID: $projectID, userId: $userId, cursor: $cursor)
    }
  `;

  const { data } = useSubscription<{
    presence: Array<{
      userId: string;
      userName: string;
      cursor: { x: number; y: number };
      color: string;
      lastActive: number;
    }>;
  }>(SUBSCRIPTION, {
    variables: { projectID },
  });

  const [updatePresence] = useMutation(UPDATE_PRESENCE);

  // Throttled cursor update
  const updateCursor = useRef<NodeJS.Timeout | null>(null);
  const sendCursorUpdate = (x: number, y: number) => {
    if (updateCursor.current) clearTimeout(updateCursor.current);

    updateCursor.current = setTimeout(() => {
      updatePresence({
        variables: {
          projectID,
          userId: userID,
          cursor: { x, y },
        },
      });
    }, 50); // Update cursor position every 50ms
  };

  return {
    activeUsers: data?.presence || [],
    sendCursorUpdate,
  };
};

/**
 * IMPROVEMENT 7: Offline queue with IndexedDB
 * Queue mutations when offline, sync when back online
 */
// @ts-ignore - Optional dependency
import { openDB, type DBSchema } from "idb";

interface CollabDrawDB extends DBSchema {
  pendingMutations: {
    key: string;
    value: {
      projectID: string;
      elements: string;
      timestamp: number;
    };
  };
  cachedProjects: {
    key: string;
    value: {
      projectID: string;
      elements: string;
      lastSync: number;
    };
  };
}

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const db = useRef<Awaited<ReturnType<typeof openDB<CollabDrawDB>>> | null>(
    null,
  );

  useEffect(() => {
    openDB<CollabDrawDB>("collab-draw", 1, {
      upgrade(database) {
        database.createObjectStore("pendingMutations");
        database.createObjectStore("cachedProjects");
      },
    }).then((database) => {
      db.current = database;
    });
  }, []);

  const queueUpdate = async (projectID: string, elements: string) => {
    if (!db.current) return;

    await db.current.put("pendingMutations", {
      projectID,
      elements,
      timestamp: Date.now(),
    }, projectID);
  };

  const processPendingUpdates = async (
    updateFn: (projectID: string, elements: string) => Promise<void>,
  ) => {
    if (!db.current || !isOnline) return;

    const pending = await db.current.getAll("pendingMutations");

    for (const update of pending) {
      try {
        await updateFn(update.projectID, update.elements);
        await db.current.delete("pendingMutations", update.projectID);
      } catch (error) {
        console.error("Failed to sync pending update:", error);
      }
    }
  };

  const cacheProject = async (projectID: string, elements: string) => {
    if (!db.current) return;

    await db.current.put("cachedProjects", {
      projectID,
      elements,
      lastSync: Date.now(),
    }, projectID);
  };

  const getCachedProject = async (projectID: string) => {
    if (!db.current) return null;
    return await db.current.get("cachedProjects", projectID);
  };

  return {
    isOnline,
    queueUpdate,
    processPendingUpdates,
    cacheProject,
    getCachedProject,
  };
};

/**
 * IMPROVEMENT 8: Conflict-free element versioning
 * Better than simple version numbers
 */
export interface VectorClock {
  [userId: string]: number;
}

export const compareVectorClocks = (
  v1: VectorClock,
  v2: VectorClock,
): "before" | "after" | "concurrent" => {
  let v1Greater = false;
  let v2Greater = false;

  const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);

  for (const key of allKeys) {
    const val1 = v1[key] || 0;
    const val2 = v2[key] || 0;

    if (val1 > val2) v1Greater = true;
    if (val2 > val1) v2Greater = true;
  }

  if (v1Greater && !v2Greater) return "after";
  if (v2Greater && !v1Greater) return "before";
  return "concurrent";
};

/**
 * IMPROVEMENT 9: Batch updates for better performance
 * Collect multiple changes and send as one mutation
 */
export const useBatchedUpdates = (
  updateFn: (elements: string) => Promise<void>,
  delay = 100,
) => {
  const batchRef = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToBatch = (elements: string) => {
    batchRef.current.push(elements);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (batchRef.current.length > 0) {
        // Send only the latest state
        const latestElements = batchRef.current[batchRef.current.length - 1];
        await updateFn(latestElements);
        batchRef.current = [];
      }
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { addToBatch };
};
