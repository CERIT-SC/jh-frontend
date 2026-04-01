import { useCallback, useState } from "react";

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const pushAlert = useCallback(
    (message, { variant = "", autoDismiss = true, duration = 4000 } = {}) => {
      const id =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setAlerts((prev) => [
        ...prev,
        { id, message, variant, autoDismiss, duration },
      ]);
    },
    [],
  );

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return { alerts, pushAlert, removeAlert, clearAlerts };
}
