import { useEffect, useState } from "react";
import { Alert as EInfraAlert, AlertDescription } from "@e-infra/design-system";
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
  const [dismissing, setDismissing] = useState(false);

  return (
    <EInfraAlert
      variant={alert.variant ?? "default"}
      className="w-[400px] top-0 shadow-lg shadow-secondary/20 backdrop-blur-md cursor-pointer alert-enter transition-all duration-300"
      // className="w-[400px] top-0 border-error bg-error/25 text-error-foreground shadow-lg shadow-secondary/20 backdrop-blur-md supports-backdrop-filter:bg-error/20 cursor-pointer alert-enter transition-all duration-300"
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
      {alert.variant === "error" && <CircleX className="h-4 w-4" />}
      {alert.variant === "success" && <Check className="h-4 w-4" />}
      {alert.variant === "warning" && <AlertTriangle className="h-4 w-4" />}

      <AlertDescription>{alert.message}</AlertDescription>
    </EInfraAlert>
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
