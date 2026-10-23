import { useTranslations } from "next-intl";

import type { CHOCOLATES } from "../gift-builder.config";
import { QuantityStepper } from "./quantity-stepper";

type ChocolateRowProps = {
  chocolate: (typeof CHOCOLATES)[number];
  count: number;
  canAdd: boolean;
  disabled: boolean;
  onAdd: () => void;
  onRemove: () => void;
};

/** One chocolate: color chip, name, description, price and the quantity stepper. */
export function ChocolateRow({
  chocolate,
  count,
  canAdd,
  disabled,
  onAdd,
  onRemove,
}: ChocolateRowProps) {
  const t = useTranslations();
  const name = t(`chocolates.${chocolate.id}.name`);

  return (
    <li className="flex items-center gap-3 py-3">
      <span
        aria-hidden
        className="size-10 shrink-0 rounded-lg border border-black/10"
        style={{
          background: `linear-gradient(135deg, ${chocolate.colors.wrapper} 60%, ${chocolate.colors.accent} 60%)`,
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {t(`chocolates.${chocolate.id}.description`)}
        </p>
        <p className="text-xs font-medium">{t("common.price", { price: chocolate.price })}</p>
      </div>
      <QuantityStepper
        count={count}
        addLabel={t("chocolates.add", { name })}
        removeLabel={t("chocolates.remove", { name })}
        countLabel={t("chocolates.count", { name })}
        canAdd={canAdd && !disabled}
        canRemove={count > 0 && !disabled}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    </li>
  );
}
