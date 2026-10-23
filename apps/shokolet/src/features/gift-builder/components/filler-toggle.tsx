import { Switch } from "@repo/ui/components/switch";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { FILLER } from "../gift-builder.config";

type FillerToggleProps = {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
};

/** Step 4: colored paper straw under the chocolates. */
export function FillerToggle({ checked, disabled, onToggle }: FillerToggleProps) {
  const t = useTranslations();
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="font-semibold">{t("filler.label")}</span>
        <span className="text-xs text-muted-foreground">{t("filler.description")}</span>
        <span className="text-xs font-medium">{t("common.price", { price: FILLER.price })}</span>
      </label>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onToggle} />
    </div>
  );
}
