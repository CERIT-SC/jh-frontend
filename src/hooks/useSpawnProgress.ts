import { useCallback, useRef, useState } from "react";
import type {
  ConnectionState,
  EventLogEntry,
  SpawnProgressEvent,
} from "../types/spawnProgress";
import { MAX_EVENT_LOG_ENTRIES } from "../types/spawnProgress";
import { useEventSource } from "./useEventSource";

interface UseSpawnProgressOptions {
  /** SSE progress endpoint URL */
  url: string;
  /** Send cookies with cross-origin requests */
  withCredentials?: boolean;
  /** Called when the server signals `ready: true` */
  onReady?: () => void;
  /** Called when the server signals `failed: true` or connection fails permanently */
  onFailed?: (error: Error) => void;
}

interface UseSpawnProgressReturn {
  /** Current progress percentage (0–100) */
  progress: number;
  /** Most recent plain-text status message */
  message: string;
  /** Ordered list of all received event log entries */
  eventLog: EventLogEntry[];
  /** Whether the server has signalled ready */
  isReady: boolean;
  /** Whether the spawn has failed */
  isFailed: boolean;
  /** Current SSE connection state */
  connectionState: ConnectionState;
  /** Number of reconnection attempts made */
  reconnectAttempts: number;
  /** Manually trigger a reconnection */
  reconnect: () => void;
  /** Disconnect and stop auto-reconnecting */
  disconnect: () => void;
}

/**
 * Manages JupyterHub spawn-progress state by combining the generic
 * `useEventSource` hook with domain-specific parsing and state tracking.
 */
export function useSpawnProgress({
  url,
  withCredentials = true,
  onReady,
  onFailed,
}: UseSpawnProgressOptions): UseSpawnProgressReturn {
  // ── Mutable refs for values updated on every SSE event ──────────────
  const progressRef = useRef(0);
  const messageRef = useRef("");
  const eventLogRef = useRef<EventLogEntry[]>([]);
  const isReadyRef = useRef(false);
  const isFailedRef = useRef(false);
  const eventIndexRef = useRef(0);

  // Stable callback refs
  const onReadyRef = useRef(onReady);
  const onFailedRef = useRef(onFailed);
  onReadyRef.current = onReady;
  onFailedRef.current = onFailed;

  // Ref to store disconnect function for use in handleMessage
  const internalDisconnectRef = useRef<(() => void) | null>(null);

  // ── Render trigger ──────────────────────────────────────────────────
  const [renderTick, setRenderTick] = useState(0);

  const scheduleRender = useCallback(() => {
    setRenderTick((prev) => prev + 1);
  }, []);

  // ── SSE message handler ────────────────────────────────────────────
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      let evt: SpawnProgressEvent;
      try {
        evt = JSON.parse(event.data) as SpawnProgressEvent;
      } catch {
        return;
      }

      if (evt.progress !== undefined) {
        progressRef.current = Math.max(0, Math.min(100, evt.progress));
      }

      if (evt.html_message !== undefined) {
        messageRef.current = evt.html_message.replace(/<[^>]*>/g, "");
      } else if (evt.message !== undefined) {
        messageRef.current = evt.message;
      }

      const entry: EventLogEntry = {
        id: `${Date.now()}-${eventIndexRef.current}`,
        index: eventIndexRef.current,
        timestamp: Date.now(),
        progress: progressRef.current,
        message: messageRef.current,
        htmlMessage: evt.html_message ?? null,
        isFailed: evt.failed === true,
        isReady: evt.ready === true,
      };
      eventIndexRef.current += 1;

      // Append and cap at MAX_EVENT_LOG_ENTRIES
      eventLogRef.current = [...eventLogRef.current, entry].slice(
        -MAX_EVENT_LOG_ENTRIES,
      );

      if (evt.ready) {
        isReadyRef.current = true;
        onReadyRef.current?.();
        // Disconnect SSE - no more events needed after ready
        internalDisconnectRef.current?.();
      }

      if (evt.failed) {
        isFailedRef.current = true;
        onFailedRef.current?.(new Error("Server spawn failed"));
        // Disconnect SSE - no more events needed after failure
        internalDisconnectRef.current?.();
      }

      scheduleRender();
    },
    [scheduleRender],
  );

  const handleError = useCallback(
    (error: Error) => {
      isFailedRef.current = true;
      onFailedRef.current?.(error);
      scheduleRender();
    },
    [scheduleRender],
  );

  // ── Delegate connection lifecycle to useEventSource ─────────────────
  const { connectionState, reconnectAttempts, reconnect, disconnect } =
    useEventSource({
      url,
      withCredentials,
      onMessage: handleMessage,
      onError: handleError,
    });

  internalDisconnectRef.current = disconnect;

  void renderTick;

  return {
    progress: progressRef.current,
    message: messageRef.current,
    eventLog: eventLogRef.current,
    isReady: isReadyRef.current,
    isFailed: isFailedRef.current,
    connectionState,
    reconnectAttempts,
    reconnect,
    disconnect,
  };
}
