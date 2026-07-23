import { useEffect, useRef, useState } from "react";
import {
  Alert as DesignSystemAlert,
  AlertTitle,
  AlertDescription,
  cn,
} from "@e-infra/design-system";
import { AlertTriangle, Check, CircleX, Info } from "lucide-react";

export interface AlertItem {
  id: string;
  message: string;
  title?: string;
  variant?: "error" | "success" | "warning" | "default";
  autoDismiss?: boolean;
  duration?: number;
}

interface AlertStackProps {
  alerts: AlertItem[];
  onRemove: (id: string) => void;
}

/** Exit animation duration in ms */
const EXIT_DURATION_MS = 300;

/** Get icon component based on variant */
const getIcon = (variant: AlertItem["variant"]) => {
  switch (variant) {
    case "error":
      return <CircleX className="h-4 w-4 shrink-0" />;
    case "success":
      return <Check className="h-4 w-4 shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 shrink-0" />;
    default:
      return <Info className="h-4 w-4 shrink-0" />;
  }
};

function AlertCard({
  alert,
  onRemove,
  isForcedExiting = false,
}: {
  alert: AlertItem;
  onRemove: (id: string) => void;
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

  return (
    <div
      className={cn(
        "w-full overflow-hidden transition-all duration-300 ease-out",
        isVisible && !isExiting
          ? "max-h-32 translate-y-0 opacity-100"
          : "max-h-0 -translate-y-2 opacity-0",
      )}
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
      <DesignSystemAlert variant={alert.variant} className="cursor-pointer">
        {getIcon(alert.variant)}
        {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
        <AlertDescription>{alert.message}</AlertDescription>
      </DesignSystemAlert>
    </div>
  );
}

/**
 * Renders a stack of alert notifications at the top-center
 */
export function AlertStack({ alerts, onRemove }: AlertStackProps) {
  const [exitingAlerts, setExitingAlerts] = useState<AlertItem[]>([]);
  const prevAlertsRef = useRef<AlertItem[]>(alerts);

  useEffect(() => {
    const prev = prevAlertsRef.current;
    const currentIds = new Set(alerts.map((a) => a.id));

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
