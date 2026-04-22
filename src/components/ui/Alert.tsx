import { useEffect } from "react";
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
  useEffect(() => {
    if (!alert.autoDismiss) return;

    const timeout = setTimeout(() => {
      onRemove(alert.id);
    }, alert.duration ?? 5000);

    return () => clearTimeout(timeout);
  }, [alert, onRemove]);

  const handleDismiss = () => {
    onRemove(alert.id);
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
      className={`w-[400px] top-0 border rounded-lg px-4 py-3 text-sm cursor-pointer alert-enter transition-all duration-300 flex items-start gap-3 ${getVariantStyles()}`}
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
      {getIcon()}
      <AlertDescription>{alert.message}</AlertDescription>
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
