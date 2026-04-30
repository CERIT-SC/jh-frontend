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

function AlertCard({
  alert,
  onRemove,
}: {
  alert: AlertItem;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);

  const startDismiss = () => {
    if (isExiting) return;

    setIsExiting(true);
    dismissTimerRef.current = window.setTimeout(() => {
      onRemove(alert.id);
    }, 300);
  };

  useEffect(() => {
    // Trigger the enter transition after initial mount.
    const frameId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!alert.autoDismiss) return;

    const timeout = setTimeout(() => {
      startDismiss();
    }, alert.duration ?? 5000);

    return () => clearTimeout(timeout);
  }, [alert.autoDismiss, alert.duration]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    startDismiss();
  };

  const getVariantStyles = () => {
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
    if (alert.variant === "error")
      return <CircleX className="h-4 w-4 shrink-0" />;
    if (alert.variant === "success")
      return <Check className="h-4 w-4 shrink-0" />;
    if (alert.variant === "warning")
      return <AlertTriangle className="h-4 w-4 shrink-0" />;
    return null;
  };

  return (
    <div
      className={`w-[400px] top-0 overflow-hidden transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? "max-h-32 translate-y-0 opacity-100 mb-0"
          : "max-h-0 -translate-y-2 opacity-0 mb-0"
      }`}
      onClick={handleDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleDismiss();
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

export function Alert({ alerts, onRemove }: AlertStackProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-60 flex justify-center w-full px-2 pointer-events-none">
      <div className="flex w-full max-w-md flex-col gap-2 pointer-events-auto">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
