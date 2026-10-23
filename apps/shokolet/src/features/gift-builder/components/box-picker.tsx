import { cn } from "@repo/ui/lib/utils";
import { useTranslations } from "next-intl";

import type { BoxId } from "../gift-builder.config";

type BoxOption = { id: BoxId; price: number; capacity: number; fits: boolean };

type BoxPickerProps = {
  boxId: BoxId;
  options: BoxOption[];
  disabled: boolean;
  onSelect: (boxId: BoxId) => void;
};

/** Step 1: the box shape. A box is disabled when the current chocolates would not fit. */
export function BoxPicker({ boxId, options, disabled, onSelect }: BoxPickerProps) {
  const t = useTranslations();

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((box) => (
        <button
          key={box.id}
          type="button"
          aria-pressed={box.id === boxId}
          disabled={disabled || !box.fits}
          onClick={() => onSelect(box.id)}
          className={cn(
            "flex flex-col gap-1 rounded-xl border p-3 text-start transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            box.id === boxId ? "border-cocoa bg-cream ring-cocoa ring-1" : "hover:bg-muted",
          )}
        >
          <span className="font-semibold">{t(`boxes.${box.id}.name`)}</span>
          <span className="text-xs text-muted-foreground">
            {t("boxes.capacity", { capacity: box.capacity })}
          </span>
          <span className="text-xs font-medium">{t("common.price", { price: box.price })}</span>
          {!box.fits && <span className="text-xs text-destructive">{t("boxes.tooSmall")}</span>}
        </button>
      ))}
    </div>
  );
}
