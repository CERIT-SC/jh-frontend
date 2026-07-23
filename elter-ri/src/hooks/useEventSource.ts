import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ConnectionState,
  EventSourceReconnectConfig,
} from "../types/spawnProgress";
import { DEFAULT_RECONNECT_CONFIG } from "../types/spawnProgress";

interface UseEventSourceOptions {
  /** SSE endpoint URL */
  url: string;
  /** Send cookies with cross-origin requests */
  withCredentials?: boolean;
  /** Reconnection configuration; pass `null` to disable auto-reconnect */
  reconnect?: EventSourceReconnectConfig | null;
  /** Called for each incoming SSE message */
  onMessage?: (event: MessageEvent) => void;
  /** Called when the connection transitions to "error" state after all retries exhausted */
  onError?: (error: Error) => void;
  /** Called when the connection is first established */
  onOpen?: () => void;
}

interface UseEventSourceReturn {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Most recent error, if any */
  error: Error | null;
  /** Number of consecutive reconnection attempts made */
  reconnectAttempts: number;
  /** Manually trigger a reconnection attempt */
  reconnect: () => void;
  /** Close the connection and stop auto-reconnecting */
  disconnect: () => void;
}

/**
 * Encapsulates EventSource lifecycle management with automatic
 * exponential-backoff reconnection.
 */
export function useEventSource({
  url,
  withCredentials = false,
  reconnect = DEFAULT_RECONNECT_CONFIG,
  onMessage,
  onError,
  onOpen,
}: UseEventSourceOptions): UseEventSourceReturn {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDisposedRef = useRef(false);
  const attemptCountRef = useRef(0);

  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;
  onOpenRef.current = onOpen;

  const reconnectConfig = reconnect ?? null;

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (isDisposedRef.current) return;

    cleanup();
    setConnectionState("connecting");
    setError(null);

    reconnectTimerRef.current = setTimeout(() => {
      if (isDisposedRef.current) return;

      const es = new EventSource(url, { withCredentials });
      eventSourceRef.current = es;

      es.onopen = () => {
        if (isDisposedRef.current) return;
        setConnectionState("connected");
        // Reset attempt counter on successful connection
        attemptCountRef.current = 0;
        setReconnectAttempts(0);
        onOpenRef.current?.();
      };

      es.onmessage = (event: MessageEvent) => {
        if (isDisposedRef.current) return;
        onMessageRef.current?.(event);
      };

      es.onerror = () => {
        if (isDisposedRef.current) return;

        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        setConnectionState("error");

        const reconnectError = new Error(`SSE connection error for: ${url}`);
        setError(reconnectError);

        // Attempt reconnection if configured
        if (reconnectConfig) {
          const nextAttempt = attemptCountRef.current + 1;
          attemptCountRef.current = nextAttempt;
          setReconnectAttempts(nextAttempt);

          if (nextAttempt <= reconnectConfig.maxAttempts) {
            const delay = Math.min(
              reconnectConfig.initialDelay *
                Math.pow(reconnectConfig.backoffMultiplier, nextAttempt - 1),
              reconnectConfig.maxDelay,
            );

            reconnectTimerRef.current = setTimeout(() => {
              if (!isDisposedRef.current) {
                connect();
              }
            }, delay);
          } else {
            // All retries exhausted — report terminal error
            onErrorRef.current?.(reconnectError);
          }
        } else {
          // No reconnection configured — report immediately
          onErrorRef.current?.(reconnectError);
        }
      };
    }, 1500);
  }, [url, withCredentials, reconnectConfig, cleanup]);

  const manualReconnect = useCallback(() => {
    attemptCountRef.current = 0;
    setReconnectAttempts(0);
    setError(null);
    isDisposedRef.current = false;
    connect();
  }, [connect]);

  const disconnect = useCallback(() => {
    isDisposedRef.current = true;
    cleanup();
    setConnectionState("disconnected");
  }, [cleanup]);

  // Connect on mount / URL change; disconnect on unmount
  useEffect(() => {
    isDisposedRef.current = false;
    connect();

    return () => {
      isDisposedRef.current = true;
      cleanup();
    };
  }, [connect, cleanup]);

  return {
    connectionState,
    error,
    reconnectAttempts,
    reconnect: manualReconnect,
    disconnect,
  };
}
