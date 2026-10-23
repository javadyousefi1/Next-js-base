import { Button } from "@repo/ui/components/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useFormatter } from "next-intl";

type QuantityStepperProps = {
  count: number;
  addLabel: string;
  removeLabel: string;
  countLabel: string;
  canAdd: boolean;
  canRemove: boolean;
  onAdd: () => void;
  onRemove: () => void;
};

/** − count + control. */
export function QuantityStepper({
  count,
  addLabel,
  removeLabel,
  countLabel,
  canAdd,
  canRemove,
  onAdd,
  onRemove,
}: QuantityStepperProps) {
  const format = useFormatter();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label={removeLabel}
        disabled={!canRemove}
        onClick={onRemove}
      >
        <MinusIcon />
      </Button>
      <output aria-label={countLabel} className="w-6 text-center font-semibold tabular-nums">
        {format.number(count)}
      </output>
      <Button
        variant="outline"
        size="icon"
        aria-label={addLabel}
        disabled={!canAdd}
        onClick={onAdd}
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
