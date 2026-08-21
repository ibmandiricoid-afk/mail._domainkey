import { useState, useCallback } from "react";
import { BankingNotification } from "../types";

export function useNotification() {
  const [bankingNotifications, setBankingNotifications] = useState<BankingNotification[]>([]);

  const addNotification = useCallback((notification: Omit<BankingNotification, "id" | "timestamp">) => {
    const newNotif: BankingNotification = {
      ...notification,
      id: "notif_" + Date.now().toString() + "_" + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    setBankingNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setBankingNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setBankingNotifications([]);
  }, []);

  return {
    bankingNotifications,
    setBankingNotifications,
    addNotification,
    dismissNotification,
    clearNotifications,
  };
}
