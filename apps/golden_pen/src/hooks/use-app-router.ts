"use client";

import { useTopLoader } from "nextjs-toploader";

import { useRouter } from "@/i18n/navigation";

type Router = ReturnType<typeof useRouter>;

/**
 * Locale-aware router (`@/i18n/navigation`) that also starts the top progress bar for
 * programmatic navigation (`<Link>` clicks are picked up by the loader automatically).
 * Always pass a path from `ROUTES`.
 */
export function useAppRouter() {
  const router = useRouter();
  const loader = useTopLoader();

  return {
    ...router,
    push: (...args: Parameters<Router["push"]>) => {
      loader.start();
      router.push(...args);
    },
    replace: (...args: Parameters<Router["replace"]>) => {
      loader.start();
      router.replace(...args);
    },
  };
}
