import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventLogEntry } from "../../../types/spawnProgress";
import { EventLogItem } from "./EventLogItem";

/** Number of extra items rendered above/below the visible viewport */
const OVERSCAN = 5;

/** Fixed row height in pixels — matches the py-2 + text-sm line height */
const ITEM_HEIGHT = 40;

/** Maximum container height before scrolling */
const CONTAINER_MAX_HEIGHT = 320;

interface EventLogListProps {
  entries: EventLogEntry[];
  className?: string;
}

export function EventLogList({ entries, className }: EventLogListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(CONTAINER_MAX_HEIGHT);
  const isAutoScrollRef = useRef(true);

  const totalHeight = entries.length * ITEM_HEIGHT;

  const needsVirtualization = totalHeight > CONTAINER_MAX_HEIGHT;

  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN,
  );
  const endIndex = Math.min(
    entries.length,
    startIndex + visibleCount + OVERSCAN * 2,
  );

  const offsetY = startIndex * ITEM_HEIGHT;

  const visibleEntries = useMemo(
    () => entries.slice(startIndex, endIndex),
    [entries, startIndex, endIndex],
  );

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    setScrollTop(el.scrollTop);

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAutoScrollRef.current = distanceFromBottom <= ITEM_HEIGHT * 2;
  }, []);

  // ── Auto-scroll on new entries ──────────────────────────────────────
  useEffect(() => {
    if (!isAutoScrollRef.current) return;

    const el = containerRef.current;
    if (!el) return;

    // Use requestAnimationFrame to avoid layout thrashing
    const rafId = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

    return () => cancelAnimationFrame(rafId);
  }, [entries.length]);

  // ── Measure container height ────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // ── Initial scroll to bottom ────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rafId = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`event-log-scroll ${className ?? ""}`}
      onScroll={handleScroll}
      role="list"
      aria-label="Spawn progress event log"
      style={{
        maxHeight: CONTAINER_MAX_HEIGHT,
        overflowY: "auto",
        position: "relative",
      }}
    >
      {entries.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-text-muted text-sm">
          Waiting for events…
        </div>
      ) : needsVirtualization ? (
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleEntries.map((entry) => (
              <EventLogItem key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ) : (
        entries.map((entry) => <EventLogItem key={entry.id} entry={entry} />)
      )}
    </div>
  );
}
