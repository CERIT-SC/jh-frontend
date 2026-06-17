import type { SpawnProgressEvent } from "../types/spawnProgress";

/**
 * Strips JupyterHub's leading timestamp prefix from message strings.
 *
 * Matches patterns:
 * - `2026-04-28T11:11:56Z`       (ISO 8601 with Z timezone)
 * - `2026-04-28T11:11:56.123Z`   (ISO 8601 with milliseconds)
 * - `2026-04-28T11:11:56+02:00`  (ISO 8601 with offset)
 * - `[12:34:56]`                  (bracketed time-only)
 * - `12:34:56.`                   (dotted with milliseconds)
 * - `2024-01-01 12:34:56`        (full datetime without T)
 */
const TIMESTAMP_PREFIX_RE =
  /^\s*(?:\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?|\[?\d{2}:\d{2}:\d{2}(?:\.\d+)?\]?)\s*/;

export function stripTimestampPrefix(text: string): string {
  return text.replace(TIMESTAMP_PREFIX_RE, "").trim();
}

/**
 * Strips leading level markers such as `[Warning]` or `[Error]` from messages.
 */
const LEVEL_PREFIX_RE = /^\s*\[(Normal|Warning|Error|Info)\]\s*/i;

export function stripLevelPrefix(text: string): string {
  return text.replace(LEVEL_PREFIX_RE, "").trim();
}

/**
 * Strips both timestamp and level prefixes from a message.
 */
export function stripMessagePrefix(text: string): string {
  return stripLevelPrefix(stripTimestampPrefix(text));
}

function parseTimestamp(value: string): number | undefined {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseTimestampPrefix(text: string | undefined): number | undefined {
  if (typeof text !== "string") return undefined;
  const match = text.match(TIMESTAMP_PREFIX_RE);
  if (!match) return undefined;
  return parseTimestamp(match[0].trim());
}

/**
 * Extracts the event timestamp from the message text prefix, falling back
 * to `raw_event.eventTime`. Falls back to the provided fallback
 * (defaults to Date.now()) if no timestamp is found anywhere.
 */
export function extractEventTimestamp(
  event: SpawnProgressEvent,
  fallback: number = Date.now(),
): number {
  // Prefer the timestamp prefix from the message text; it is always present
  // in progress events, while raw_event.eventTime is often null.
  const fromMessage =
    parseTimestampPrefix(event.message) ??
    parseTimestampPrefix(event.html_message);
  if (fromMessage !== undefined) return fromMessage;

  const rawEvent = event.raw_event as Record<string, unknown> | undefined;
  const eventTime = rawEvent?.eventTime;
  if (typeof eventTime === "string") {
    const parsed = parseTimestamp(eventTime);
    if (parsed !== undefined) return parsed;
  }

  return fallback;
}
