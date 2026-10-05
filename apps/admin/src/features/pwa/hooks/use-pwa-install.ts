"use client";

import { useEventListener } from "@repo/hooks/use-event-listener";
import { useIsClient } from "@repo/hooks/use-is-client";
import { useMediaQuery } from "@repo/hooks/use-media-query";
import { useState } from "react";

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

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  return {
    status: getStatus(isStandalone, promptEvent !== null, isIos),
    install: () => void install(),
  };
}
