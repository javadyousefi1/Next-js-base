import { useTranslations } from "next-intl";

import { CHOCOLATES, type ChocolateId } from "../gift-builder.config";
import { ChocolateRow } from "./chocolate-row";

type ChocolateListProps = {
  counts: Record<ChocolateId, number>;
  isFull: boolean;
  disabled: boolean;
  onAdd: (chocolateId: ChocolateId) => void;
  onRemove: (chocolateId: ChocolateId) => void;
};

/** Step 3: the chocolates and how many of each. */
export function ChocolateList({ counts, isFull, disabled, onAdd, onRemove }: ChocolateListProps) {
  const t = useTranslations();

  return (
    <div>
      <ul className="divide-y">
        {CHOCOLATES.map((chocolate) => (
          <ChocolateRow
            key={chocolate.id}
            chocolate={chocolate}
            count={counts[chocolate.id]}
            canAdd={!isFull}
            disabled={disabled}
            onAdd={() => onAdd(chocolate.id)}
            onRemove={() => onRemove(chocolate.id)}
          />
        ))}
      </ul>
      {isFull && <p className="pt-2 text-xs text-muted-foreground">{t("chocolates.full")}</p>}
    </div>
  );
}
