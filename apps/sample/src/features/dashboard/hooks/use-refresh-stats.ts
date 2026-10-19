"use client";

import { useTransition } from "react";

import { refreshDashboardStats } from "../server/dashboard.actions";

export function useRefreshStats() {
  const [isRefreshing, startTransition] = useTransition();
  return {
    isRefreshing,
    refresh: () => startTransition(() => refreshDashboardStats()),
  };
}
