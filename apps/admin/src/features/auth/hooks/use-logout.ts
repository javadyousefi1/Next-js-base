"use client";

import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/config/routes";
import { useAppRouter } from "@/hooks/use-app-router";

import { logoutMutation } from "../api/auth.queries";

export function useLogout() {
  const router = useAppRouter();
  const queryClient = useQueryClient();
  const mutation = logoutMutation.useMutation({
    onSuccess: () => {
      // Never keep the previous user's data in memory.
      queryClient.clear();
      router.replace(ROUTES.login);
    },
  });

  return { logout: () => mutation.mutate(), isLoggingOut: mutation.isPending };
}
