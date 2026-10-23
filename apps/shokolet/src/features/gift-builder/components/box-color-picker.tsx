import { cn } from "@repo/ui/lib/utils";
import { useTranslations } from "next-intl";

import { BOX_COLORS, type BoxColorId } from "../gift-builder.config";

type BoxColorPickerProps = {
  colorId: BoxColorId;
  onSelect: (colorId: BoxColorId) => void;
};

/** Step 2: round swatches for the box color scheme. */
export function BoxColorPicker({ colorId, onSelect }: BoxColorPickerProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap gap-3">
      {BOX_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          aria-label={t(`colors.${color.id}`)}
          aria-pressed={color.id === colorId}
          title={t(`colors.${color.id}`)}
          onClick={() => onSelect(color.id)}
          style={{ backgroundColor: color.box }}
          className={cn(
            "size-9 rounded-full border border-black/10 transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50",
            color.id === colorId && "ring-cocoa ring-2 ring-offset-2",
          )}
        />
      ))}
    </div>
  );
}
