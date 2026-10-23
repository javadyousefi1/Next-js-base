import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { useTranslations } from "next-intl";

type OrderSummaryProps = {
  totals: { chocolates: number; box: number; filler: number; total: number };
  wrapped: boolean;
  canWrap: boolean;
  onWrap: () => void;
  onUnwrap: () => void;
  onPlaceOrder: () => void;
  onReset: () => void;
};

/** Step 5: price lines, wrap / order buttons and reset. */
export function OrderSummary({
  totals,
  wrapped,
  canWrap,
  onWrap,
  onUnwrap,
  onPlaceOrder,
  onReset,
}: OrderSummaryProps) {
  const t = useTranslations();
  const lines = [
    { key: "box", price: totals.box },
    { key: "chocolates", price: totals.chocolates },
    { key: "filler", price: totals.filler },
  ] as const;

  return (
    <div className="flex flex-col gap-3">
      <dl className="flex flex-col gap-1.5 text-sm">
        {lines.map((line) => (
          <div key={line.key} className="flex justify-between">
            <dt className="text-muted-foreground">{t(`summary.${line.key}`)}</dt>
            <dd>{t("common.price", { price: line.price })}</dd>
          </div>
        ))}
        <Separator className="my-1" />
        <div className="flex justify-between text-base font-bold">
          <dt>{t("summary.total")}</dt>
          <dd>{t("common.price", { price: totals.total })}</dd>
        </div>
      </dl>

      {wrapped ? (
        <>
          <Button size="lg" onClick={onPlaceOrder}>
            {t("order.place")}
          </Button>
          <Button variant="secondary" onClick={onUnwrap}>
            {t("summary.unwrap")}
          </Button>
        </>
      ) : (
        <>
          <Button size="lg" disabled={!canWrap} onClick={onWrap}>
            {t("summary.wrap")}
          </Button>
          {!canWrap && <p className="text-xs text-muted-foreground">{t("summary.needItem")}</p>}
        </>
      )}
      <Button variant="ghost" onClick={onReset}>
        {t("summary.reset")}
      </Button>
    </div>
  );
}
