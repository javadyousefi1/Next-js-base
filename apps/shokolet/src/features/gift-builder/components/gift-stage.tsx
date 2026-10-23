"use client";

import { Badge } from "@repo/ui/components/badge";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import type { GiftState } from "../gift-builder.state";

// Three.js is browser-only and heavy: load the scene on the client, show a skeleton meanwhile.
const GiftScene = dynamic(() => import("./scene/gift-scene").then((m) => m.GiftScene), {
  ssr: false,
  loading: () => <StageLoading />,
});

function StageLoading() {
  const t = useTranslations("stage");

  return (
    <div className="grid h-full place-items-center">
      <div className="text-cocoa/70 flex items-center gap-2 text-sm">
        <Spinner aria-label={t("loading")} />
        {t("loading")}
      </div>
    </div>
  );
}

type GiftStageProps = {
  state: GiftState;
  capacity: number;
};

/** The 3D stage with its overlays: capacity, drag hint and the empty-state message. */
export function GiftStage({ state, capacity }: GiftStageProps) {
  const t = useTranslations("stage");

  return (
    <div className="sticky top-2 z-10 h-[40vh] min-h-72 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_40%,#fff3e0_0%,#f6d9bd_55%,#e7b78f_100%)] shadow-inner ring-1 ring-black/5 lg:top-6 lg:h-[min(78vh,720px)]">
      <GiftScene state={state} />

      <Badge
        variant="secondary"
        aria-live="polite"
        aria-label={t("capacityLabel")}
        className="absolute start-4 top-4 h-7 px-3 text-sm"
      >
        {t("capacity", { count: state.items.length, capacity })}
      </Badge>

      <p className="text-cocoa/60 pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs">
        {t("hint")}
      </p>

      {state.items.length === 0 && (
        <p className="text-cocoa pointer-events-none absolute inset-x-6 bottom-12 rounded-2xl bg-white/70 p-3 text-center text-sm shadow-sm backdrop-blur">
          {t("empty")}
        </p>
      )}
    </div>
  );
}
