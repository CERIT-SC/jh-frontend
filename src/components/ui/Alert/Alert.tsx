import { useEffect, useRef, useState } from "react";
import { AlertDescription } from "@e-infra/design-system";
import { AlertTriangle, Check, CircleX } from "lucide-react";

export interface AlertItem {
  id: string;
  message: string;
  variant?: "error" | "success" | "warning" | "default";
  autoDismiss?: boolean;
  duration?: number;
}

interface AlertStackProps {
  alerts: AlertItem[];
  onRemove: (id: string) => void;
}

/** Exit animation duration in ms — must match the CSS `transition-duration`. */
const EXIT_DURATION_MS = 300;

function AlertCard({
  alert,
  onRemove,
  isForcedExiting = false,
}: {
  alert: AlertItem;
  onRemove: (id: string) => void;
  /** When `true`, the card plays its exit animation immediately (used for
   *  alerts evicted by the visible-limit). */
  isForcedExiting?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSelfExiting, setIsSelfExiting] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);

  const startDismiss = (): void => {
    if (isSelfExiting) return;

    setIsSelfExiting(true);
    dismissTimerRef.current = window.setTimeout(() => {
      onRemove(alert.id);
    }, EXIT_DURATION_MS);
  };

  useEffect(() => {
    // Trigger the enter transition after initial mount.
    const frameId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!alert.autoDismiss) return;

    const timeout = setTimeout(startDismiss, alert.duration ?? 5000);
    return () => clearTimeout(timeout);
  }, [alert.autoDismiss, alert.duration]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const isExiting = isForcedExiting || isSelfExiting;

  const getVariantStyles = (): string => {
    switch (alert.variant) {
      case "error":
        return "border-error bg-error/10 text-error";
      case "success":
        return "border-success bg-success/10 text-success";
      case "warning":
        return "border-warning bg-warning/10 text-warning";
      default:
        return "border-border bg-background text-text";
    }
  };

  const getIcon = () => {
    switch (alert.variant) {
      case "error":
        return <CircleX className="h-4 w-4 shrink-0" />;
      case "success":
        return <Check className="h-4 w-4 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full overflow-hidden transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? "max-h-32 translate-y-0 opacity-100"
          : "max-h-0 -translate-y-2 opacity-0"
      }`}
      onClick={startDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startDismiss();
        }
      }}
    >
      <div
        className={`border rounded-lg px-4 py-3 text-sm cursor-pointer flex items-start gap-3 ${getVariantStyles()}`}
      >
        {getIcon()}
        <AlertDescription>{alert.message}</AlertDescription>
      </div>
    </div>
  );
}

/**
 * Renders a stack of toast-style alert notifications at the top-center of the
 * viewport.
 *
 * When an alert is removed from the `alerts` prop (e.g. by the
 * `MAX_VISIBLE_ALERTS` limit in `useAlerts`), the component keeps the
 * removed alert in the DOM briefly so it can play its exit animation before
 * being unmounted.
 *
 * The container is viewport-constrained so alerts never obscure the entire
 * screen — a `max-height` with `overflow-y-auto` ensures scrollability if
 * the stack would otherwise exceed the available space.
 */
export function Alert({ alerts, onRemove }: AlertStackProps) {
  /** Alerts removed from props but still playing their exit animation. */
  const [exitingAlerts, setExitingAlerts] = useState<AlertItem[]>([]);
  const prevAlertsRef = useRef<AlertItem[]>(alerts);

  useEffect(() => {
    const prev = prevAlertsRef.current;
    const currentIds = new Set(alerts.map((a) => a.id));

    // Detect alerts that were removed from props (e.g. by the
    // MAX_VISIBLE_ALERTS limit in useAlerts) and stage them for exit
    // animation before final unmount.
    const removed = prev.filter((a) => !currentIds.has(a.id));

    if (removed.length > 0) {
      setExitingAlerts((existing) => [...existing, ...removed]);

      const removedIds = new Set(removed.map((a) => a.id));
      const timer = setTimeout(() => {
        setExitingAlerts((existing) =>
          existing.filter((a) => !removedIds.has(a.id)),
        );
      }, EXIT_DURATION_MS);

      prevAlertsRef.current = alerts;
      return () => clearTimeout(timer);
    }

    prevAlertsRef.current = alerts;
  }, [alerts]);

  const exitingIds = new Set(exitingAlerts.map((a) => a.id));
  const visibleAlerts = [...alerts, ...exitingAlerts];

  if (visibleAlerts.length === 0) return null;

  return (
    <div
      className="fixed top-20 left-0 right-0 z-60 flex justify-center px-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div
        role="list"
        className="flex w-full max-w-md flex-col gap-2 pointer-events-auto max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain"
      >
        {visibleAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onRemove={onRemove}
            isForcedExiting={exitingIds.has(alert.id)}
          />
        ))}
      </div>
    </div>
  );
}
