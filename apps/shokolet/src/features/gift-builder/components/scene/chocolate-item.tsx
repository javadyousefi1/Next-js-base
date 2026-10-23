import type { Point } from "../../geometry/box-outline";
import { createRandom } from "../../geometry/random";
import { CHOCOLATES } from "../../gift-builder.config";
import { useChocolateMotion } from "../../hooks/use-chocolate-motion";
import type { PresentItem } from "../../hooks/use-item-presence";
import { ChocolateModel } from "./chocolate-model";

type ChocolateItemProps = {
  item: PresentItem;
  /** Slot center `[x, z]` of `item.slotIndex`. */
  slot: Point;
  filler: boolean;
  onExited: (uid: number) => void;
};

/** One chocolate in its slot, with its enter / move / exit animation. */
export function ChocolateItem({ item, slot, filler, onExited }: ChocolateItemProps) {
  const ref = useChocolateMotion({
    x: slot[0],
    z: slot[1],
    filler,
    leaving: item.leaving,
    onExited: () => onExited(item.uid),
  });
  const chocolate = CHOCOLATES.find((c) => c.id === item.chocolateId) ?? CHOCOLATES[0];
  // Seeded by uid: the same chocolate always leans the same way (±0.15 rad).
  const yaw = (createRandom(item.uid)() - 0.5) * 0.3;

  return (
    <group ref={ref}>
      <ChocolateModel model={chocolate.model} colors={chocolate.colors} yaw={yaw} />
    </group>
  );
}
