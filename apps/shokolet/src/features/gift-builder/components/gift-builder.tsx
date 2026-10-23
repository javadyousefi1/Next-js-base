"use client";

import { useTranslations } from "next-intl";

import { useGiftBuilder } from "../hooks/use-gift-builder";
import { BoxColorPicker } from "./box-color-picker";
import { BoxPicker } from "./box-picker";
import { BuilderStep } from "./builder-step";
import { ChocolateList } from "./chocolate-list";
import { FillerToggle } from "./filler-toggle";
import { GiftStage } from "./gift-stage";
import { OrderSummary } from "./order-summary";

/** The whole page: header, the 3D stage and the step-by-step builder panel. */
export function GiftBuilder() {
  const t = useTranslations();
  const builder = useGiftBuilder();
  const { state } = builder;

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-cocoa flex items-baseline gap-2 text-3xl font-black">
          {t("header.brand")}
          <span className="text-gold text-sm font-medium tracking-widest">
            {t("header.brandLatin")}
          </span>
        </h1>
        <p className="text-cocoa/70 text-sm">{t("header.tagline")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <GiftStage state={state} capacity={builder.capacity} />

        <div className="flex flex-col gap-4">
          {state.wrapped && (
            <p role="status" className="bg-gold/20 text-cocoa rounded-xl p-3 text-sm">
              {t("steps.locked")}
            </p>
          )}

          <BuilderStep index={1} title={t("steps.box")} disabled={state.wrapped}>
            <BoxPicker
              boxId={state.boxId}
              options={builder.boxOptions}
              disabled={state.wrapped}
              onSelect={builder.setBox}
            />
          </BuilderStep>

          <BuilderStep index={2} title={t("steps.color")} disabled={state.wrapped}>
            <BoxColorPicker colorId={state.colorId} onSelect={builder.setColor} />
          </BuilderStep>

          <BuilderStep index={3} title={t("steps.chocolates")} disabled={state.wrapped}>
            <ChocolateList
              counts={builder.counts}
              isFull={builder.isFull}
              disabled={state.wrapped}
              onAdd={builder.addChocolate}
              onRemove={builder.removeChocolate}
            />
          </BuilderStep>

          <BuilderStep index={4} title={t("steps.filler")} disabled={state.wrapped}>
            <FillerToggle
              checked={state.filler}
              disabled={state.wrapped}
              onToggle={builder.toggleFiller}
            />
          </BuilderStep>

          <BuilderStep index={5} title={t("steps.summary")}>
            <OrderSummary
              totals={builder.totals}
              wrapped={state.wrapped}
              canWrap={builder.canWrap}
              onWrap={builder.wrap}
              onUnwrap={builder.unwrap}
              onPlaceOrder={builder.placeOrder}
              onReset={builder.reset}
            />
          </BuilderStep>
        </div>
      </div>
    </main>
  );
}
