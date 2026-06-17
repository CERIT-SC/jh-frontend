import { memo, useMemo } from "react";
import type { EventLogEntry } from "../../../types/spawnProgress";
import { cn } from "@e-infra/design-system";
import { stripLevelPrefix, stripTimestampPrefix } from "../../../utils/message";
import { TriangleAlert, CircleX } from "lucide-react";

interface EventLogItemProps {
  entry: EventLogEntry;
  style?: React.CSSProperties;
}

/**
 * Strips timestamp and level HTML wrappers from html_message strings.
 */
function stripHtmlMessagePrefix(html: string): string {
  // Remove <span class="timestamp">...</span> and similar wrappers
  const cleaned = html
    .replace(
      /<span[^>]*class=["'][^"']*timestamp[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
      "",
    )
    .replace(/<time[^>]*>[\s\S]*?<\/time>/gi, "");
  // Also strip any remaining bare-text timestamp/level prefix after HTML cleanup
  return stripLevelPrefix(stripTimestampPrefix(cleaned));
}

/**
 * Sanitizes HTML stringsto prevent XSS attacks.
 */
function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Strip dangerous elements
  doc
    .querySelectorAll("script, iframe, object, embed, link[rel=stylesheet]")
    .forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (
        attr.name.startsWith("on") ||
        attr.value.toLowerCase().includes("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

export const EventLogItem = memo(function EventLogItem({
  entry,
  style,
}: EventLogItemProps) {
  const formattedTime = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Strip server-side timestamp and level prefixes to avoid duplication
  const cleanMessage = useMemo(
    () => stripLevelPrefix(stripTimestampPrefix(entry.message)),
    [entry.message],
  );
  const cleanHtmlMessage = useMemo(
    () =>
      entry.htmlMessage ? stripHtmlMessagePrefix(entry.htmlMessage) : null,
    [entry.htmlMessage],
  );

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-3 py-2 border-b border-border last:border-b-0",
        entry.isFailed && "bg-error-100",
        entry.isReady && "bg-success-100",
        entry.isWarning && "bg-warning-100 dark:bg-warning-200",
      )}
      style={style}
      role="listitem"
      aria-label={`Event at ${formattedTime}: ${cleanMessage}`}
    >
      {/* Timestamp */}
      <span className="shrink-0 text-xs text-text-muted  tabular-nums pt-0.5 select-none">
        {formattedTime}
      </span>

      {/* Progress badge */}
      <span
        className={cn(
          "shrink-0 text-xs tabular-nums px-1.5 py-0.5 rounded-sm min-w-[3ch] text-center",
          entry.isReady
            ? "bg-success-500 text-success-50"
            : entry.isFailed
              ? "bg-error-600 text-error-50"
              : entry.isWarning
                ? "bg-warning-600 text-warning-50"
                : "bg-primary-100 text-text-muted",
        )}
      >
        {entry.progress}%
      </span>

      {entry.isWarning && (
        <TriangleAlert
          size={20}
          className="shrink-0"
          color="var(--color-warning-700)"
        />
      )}
      {entry.isFailed && (
        <CircleX
          size={20}
          className="shrink-0"
          color="var(--color-error-700)"
        />
      )}
      {/* Message content — timestamp prefix stripped and sanitized */}
      <span
        className={cn(
          "text-sm text-text wrap-break-word min-w-0",
          entry.isFailed && "text-error-700",
          entry.isReady && "text-success-700",
          entry.isWarning && "text-warning-700",
        )}
      >
        {cleanHtmlMessage ? (
          <span
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleanHtmlMessage) }}
            className="[&_a]:text-primary [&_a]:underline"
          />
        ) : (
          cleanMessage
        )}
      </span>
    </div>
  );
});
