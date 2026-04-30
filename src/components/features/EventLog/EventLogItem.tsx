import { memo, useMemo } from "react";
import type { EventLogEntry } from "../../../types/spawnProgress";
import { cn } from "@e-infra/design-system";

interface EventLogItemProps {
  entry: EventLogEntry;
  style?: React.CSSProperties;
}

/**
 * Strips JupyterHub's leading timestamp prefix from message strings.
 *
 * JupyterHub prefixes messages with ISO 8601 timestamps like
 * `2026-04-28T11:11:56Z Pulling image...`
 * Since we render our own timestamp column, the embedded one is redundant.
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

function stripTimestampPrefix(text: string): string {
  return text.replace(TIMESTAMP_PREFIX_RE, "").trim();
}

/**
 * Strips timestamp HTML from html_message strings.
 *
 * JupyterHub wraps timestamps in `<span class="timestamp">` or similar,
 * or includes them as bare text before the actual message content.
 */
function stripHtmlTimestampPrefix(html: string): string {
  // Remove <span class="timestamp">...</span> and similar wrappers
  const cleaned = html
    .replace(
      /<span[^>]*class=["'][^"']*timestamp[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
      "",
    )
    .replace(/<time[^>]*>[\s\S]*?<\/time>/gi, "");
  // Also strip any remaining bare-text timestamp prefix after HTML cleanup
  return stripTimestampPrefix(cleaned);
}

/**
 * Renders a single event log entry.
 *
 * Memoized because items in a virtualized list are re-used across
 * scroll positions and must not re-render unless their data changes.
 */
export const EventLogItem = memo(function EventLogItem({
  entry,
  style,
}: EventLogItemProps) {
  const formattedTime = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Strip server-side timestamp prefix to avoid duplication with our own column
  const cleanMessage = useMemo(
    () => stripTimestampPrefix(entry.message),
    [entry.message],
  );
  const cleanHtmlMessage = useMemo(
    () =>
      entry.htmlMessage ? stripHtmlTimestampPrefix(entry.htmlMessage) : null,
    [entry.htmlMessage],
  );

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-3 py-2 border-b border-border last:border-b-0",
        entry.isFailed && "bg-error/5",
        entry.isReady && "bg-success/5",
      )}
      style={style}
      role="listitem"
      aria-label={`Event at ${formattedTime}: ${cleanMessage}`}
    >
      {/* Timestamp */}
      <span className="shrink-0 text-xs text-text-muted font-mono tabular-nums pt-0.5 select-none">
        {formattedTime}
      </span>

      {/* Progress badge */}
      <span
        className={cn(
          "shrink-0 text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-sm min-w-[3ch] text-center",
          entry.progress >= 100
            ? "bg-success/15 text-success"
            : entry.isFailed
              ? "bg-error/15 text-error"
              : "bg-primary/10 text-primary",
        )}
      >
        {entry.progress}%
      </span>

      {/* Message content — timestamp prefix stripped */}
      <span className="text-sm text-text break-words min-w-0">
        {cleanHtmlMessage ? (
          <span
            dangerouslySetInnerHTML={{ __html: cleanHtmlMessage }}
            className="[&_a]:text-primary [&_a]:underline"
          />
        ) : (
          cleanMessage
        )}
      </span>
    </div>
  );
});
