"use client";

import { DirectionProvider } from "@repo/ui/components/direction";
import { Toaster } from "@repo/ui/components/sonner";
import type { ReactNode } from "react";

type AppProvidersProps = {
  children: ReactNode;
};

/** Every client-side provider, mounted once by the root layout (Persian only: always RTL). */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <DirectionProvider direction="rtl">
      {children}
      <Toaster richColors position="bottom-center" />
    </DirectionProvider>
  );
}
