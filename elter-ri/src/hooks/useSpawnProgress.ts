import { useCallback, useRef, useState } from "react";
import type {
  ConnectionState,
  EventLogEntry,
  SpawnProgressEvent,
} from "../types/spawnProgress";
import { MAX_EVENT_LOG_ENTRIES } from "../types/spawnProgress";
import { extractEventTimestamp } from "../utils/message";
import { useEventSource } from "./useEventSource";

function isKubernetesWarning(event: SpawnProgressEvent): boolean {
  const rawEvent = event.raw_event as Record<string, unknown> | undefined;
  return rawEvent?.type === "Warning";
}

function getPodUid(event: SpawnProgressEvent): string | null {
  const rawEvent = event.raw_event as Record<string, unknown> | undefined;
  const involvedObject = rawEvent?.involvedObject as
    Record<string, unknown> | undefined;
  const uid = involvedObject?.uid;
  return typeof uid === "string" ? uid : null;
}

function isSchedulingEvent(event: SpawnProgressEvent): boolean {
  const rawEvent = event.raw_event as Record<string, unknown> | undefined;
  const reason = rawEvent?.reason;
  return reason === "Scheduled" || reason === "FailedScheduling";
}

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
  const currentPodUidRef = useRef<string | null>(null);

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

      const podUid = getPodUid(evt);

      // A new scheduling event (Scheduled or FailedScheduling) means a fresh
      // pod/retry; switch to its UID — the filter below handles cleanup.
      if (isSchedulingEvent(evt) && podUid) {
        currentPodUidRef.current = podUid;
      }

      const entry: EventLogEntry = {
        id: `${Date.now()}-${eventIndexRef.current}`,
        index: eventIndexRef.current,
        timestamp: extractEventTimestamp(evt),
        progress: progressRef.current,
        message: messageRef.current,
        htmlMessage: evt.html_message ?? null,
        isFailed: evt.failed === true,
        isReady: evt.ready === true,
        isWarning: evt.warning === true || isKubernetesWarning(evt),
        podUid,
      };
      eventIndexRef.current += 1;

      // Append and cap at MAX_EVENT_LOG_ENTRIES
      eventLogRef.current = [...eventLogRef.current, entry].slice(
        -MAX_EVENT_LOG_ENTRIES,
      );

      // Keep the synthetic "Server requested" entry from appearing later than
      // the first real event by backdating it to the earliest known timestamp.
      const firstEntry = eventLogRef.current[0];
      if (firstEntry?.message === "Server requested") {
        eventLogRef.current[0] = {
          ...firstEntry,
          timestamp: Math.min(firstEntry.timestamp, entry.timestamp),
        };
      }

      // Drop events from pods other than the current one.
      // Synthetic events without a pod UID (e.g. "Server requested") are kept.
      if (currentPodUidRef.current !== null) {
        eventLogRef.current = eventLogRef.current.filter(
          (e) => e.podUid === null || e.podUid === currentPodUidRef.current,
        );
      }

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
