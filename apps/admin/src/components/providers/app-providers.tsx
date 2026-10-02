"use client";

import { DirectionProvider } from "@repo/ui/components/direction";
import { Toaster } from "@repo/ui/components/sonner";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { useServiceWorker } from "@/features/pwa/hooks/use-service-worker";

import { QueryProvider } from "./query-provider";

type AppProvidersProps = {
  children: ReactNode;
  direction: "ltr" | "rtl";
};

/** Every client-side provider, mounted once by the root layout. */
export function AppProviders({ children, direction }: AppProvidersProps) {
  useServiceWorker();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DirectionProvider direction={direction}>
        <NuqsAdapter>
          <QueryProvider>
            <TooltipProvider>
              <NextTopLoader color="var(--primary)" height={3} showSpinner={false} />
              {children}
              <Toaster richColors position="bottom-center" />
            </TooltipProvider>
          </QueryProvider>
        </NuqsAdapter>
      </DirectionProvider>
    </ThemeProvider>
  );
}
