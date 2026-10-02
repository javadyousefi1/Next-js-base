"use client";

import { useState } from "react";

import { useEventListener } from "@/hooks/use-event-listener";
import { useIsClient } from "@/hooks/use-is-client";
import { useMediaQuery } from "@/hooks/use-media-query";

export type PwaInstallStatus = "installed" | "available" | "ios" | "unavailable";

function getStatus(isStandalone: boolean, canPrompt: boolean, isIos: boolean): PwaInstallStatus {
  if (isStandalone) return "installed";
  if (canPrompt) return "available";
  return isIos ? "ios" : "unavailable";
}

/** "Install app" flow: captures `beforeinstallprompt`, detects standalone mode and iOS. */
export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const isStandalone = useMediaQuery("(display-mode: standalone)");
  const isClient = useIsClient();
  const isIos = isClient && /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setPromptEvent(event);
  });
  useEventListener("appinstalled", () => setPromptEvent(null));

  return {
    status: getStatus(isStandalone, promptEvent !== null, isIos),
    install: async () => {
      if (!promptEvent) return;
      await promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
    },
  };
}
