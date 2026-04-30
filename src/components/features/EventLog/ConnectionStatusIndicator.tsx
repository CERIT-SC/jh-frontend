import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import type { ConnectionState } from "../../../types/spawnProgress";
import { cn } from "@e-infra/design-system";

interface ConnectionStatusIndicatorProps {
  state: ConnectionState;
  reconnectAttempts: number;
  className?: string;
}

const STATE_CONFIG: Record<
  ConnectionState,
  {
    label: string;
    icon: typeof Wifi;
    dotClass: string;
    textClass: string;
  }
> = {
  connected: {
    label: "Connected",
    icon: Wifi,
    dotClass: "bg-success",
    textClass: "text-success",
  },
  connecting: {
    label: "Connecting",
    icon: Loader2,
    dotClass: "bg-warning animate-pulse",
    textClass: "text-warning",
  },
  disconnected: {
    label: "Disconnected",
    icon: WifiOff,
    dotClass: "bg-text-muted",
    textClass: "text-text-muted",
  },
  error: {
    label: "Connection error",
    icon: AlertTriangle,
    dotClass: "bg-error",
    textClass: "text-error",
  },
};

/**
 * Visual indicator for SSE connection state with a manual reconnect action.
 */
export function ConnectionStatusIndicator({
  state,
  reconnectAttempts,
  className,
}: ConnectionStatusIndicatorProps) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  return (
    <div
      className={cn("flex items-center gap-2 text-xs select-none", className)}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${config.label}${
        reconnectAttempts > 0 ? `, retry ${reconnectAttempts}` : ""
      }`}
    >
      {/* Status dot */}
      <span
        className={cn("h-2 w-2 rounded-full shrink-0", config.dotClass)}
        aria-hidden="true"
      />

      {/* Icon + label */}
      <Icon
        className={cn("h-3.5 w-3.5 shrink-0", config.textClass, {
          "animate-spin": state === "connecting",
        })}
        aria-hidden="true"
      />
      <span className={cn(config.textClass)}>{config.label}</span>
    </div>
  );
}
