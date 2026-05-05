import { useCallback, useState } from "react";
import type { AlertItem } from "@components/ui/Alert/Alert";

/** Maximum number of alerts visible at any time. */
export const MAX_VISIBLE_ALERTS = 4;

/** Options for the {@link pushAlert} function. */
export interface PushAlertOptions {
  variant?: AlertItem["variant"];
  autoDismiss?: boolean;
  duration?: number;
}

/** Return type of the {@link useAlerts} hook. */
export interface UseAlertsReturn {
  alerts: AlertItem[];
  pushAlert: (message: string, options?: PushAlertOptions) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const removeAlert = useCallback((id: string): void => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const pushAlert = useCallback(
    (
      message: string,
      { variant, autoDismiss = true, duration = 4000 }: PushAlertOptions = {},
    ): void => {
      const id: string =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setAlerts((prev) => {
        // When the visible limit is reached, drop the oldest alert to
        // prevent the screen from being overwhelmed during error spamming.
        const current =
          prev.length >= MAX_VISIBLE_ALERTS ? prev.slice(1) : prev;

        return [...current, { id, message, variant, autoDismiss, duration }];
      });
    },
    [],
  );

  const clearAlerts = useCallback((): void => {
    setAlerts([]);
  }, []);

  return { alerts, pushAlert, removeAlert, clearAlerts };
}
