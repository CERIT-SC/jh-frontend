/**
 * Spawn progress event data received from the SSE stream.
 * Matches JupyterHub's server-progress API response shape.
 */
export interface SpawnProgressEvent {
  /** Progress percentage (0–100) */
  progress?: number;
  /** Plain-text status message */
  message?: string;
  /** HTML-formatted status message (sanitise before rendering) */
  html_message?: string;
  /** Server is ready — triggers page reload */
  ready?: boolean;
  /** Spawn has failed — show error state */
  failed?: boolean;
  /** Spawn has a non-fatal warning — show warning state */
  warning?: boolean;
  /** Allow additional JupyterHub-specific fields */
  [key: string]: unknown;
}

/**
 * Enriched event stored in the local event log.
 * Adds client-side metadata not present in the raw SSE payload.
 */
export interface EventLogEntry {
  /** Unique ID for React key and lookups */
  id: string;
  /** Monotonic index for stable ordering */
  index: number;
  /** Event timestamp in milliseconds (from message prefix or raw_event.eventTime) */
  timestamp: number;
  /** The raw progress value at this point */
  progress: number;
  /** Display-ready message (plain text) */
  message: string;
  /** Original HTML message if provided by the server */
  htmlMessage: string | null;
  /** Whether this event marked spawn failure */
  isFailed: boolean;
  /** Whether this event marked spawn completion */
  isReady: boolean;
  /** Whether this event carries a non-fatal warning */
  isWarning: boolean;
  /** Kubernetes pod UID this event belongs to (null for synthetic events) */
  podUid: string | null;
}

/** Connection states for the SSE stream */
export type ConnectionState =
  "connecting" | "connected" | "disconnected" | "error";

/** Configuration for the useEventSource reconnection behaviour */
export interface EventSourceReconnectConfig {
  /** Maximum number of consecutive reconnection attempts */
  maxAttempts: number;
  /** Initial delay in ms before the first reconnect attempt */
  initialDelay: number;
  /** Upper bound in ms for the exponential backoff delay */
  maxDelay: number;
  /** Multiplier applied to the delay after each attempt */
  backoffMultiplier: number;
}

/** Default reconnection configuration */
export const DEFAULT_RECONNECT_CONFIG: EventSourceReconnectConfig = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/** Maximum number of log entries retained in memory */
export const MAX_EVENT_LOG_ENTRIES = 1000;
