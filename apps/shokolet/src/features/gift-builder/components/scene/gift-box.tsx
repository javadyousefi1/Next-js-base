import { getSlotPositions } from "../../geometry/slots";
import {
  createBaseGeometry,
  createFloorGeometry,
  createWallGeometry,
} from "../../geometry/three-shapes";
import { BOX_COLORS, BOXES } from "../../gift-builder.config";
import type { GiftState } from "../../gift-builder.state";
import { useBoxPop } from "../../hooks/use-box-pop";
import { useColorTween } from "../../hooks/use-color-tween";
import { useItemPresence } from "../../hooks/use-item-presence";
import { useWrapTimeline } from "../../hooks/use-wrap-timeline";
import { BoxLid } from "./box-lid";
import { ChocolateItem } from "./chocolate-item";
import { FillerStrips } from "./filler-strips";

type GiftBoxProps = {
  state: GiftState;
};

/** The box with its chocolates, straw, lid and ribbon. Mounted with `key={boxId}`. */
export function GiftBox({ state }: GiftBoxProps) {
  const shape = BOXES.find((box) => box.id === state.boxId)?.shape ?? "rect";
  const colors = BOX_COLORS.find((color) => color.id === state.colorId) ?? BOX_COLORS[0];
  const slots = getSlotPositions(shape);

  const popRef = useBoxPop();
  const { giftRef, lidRef, ribbonRef, bowRef } = useWrapTimeline(state.wrapped);
  const boxMaterial = useColorTween(colors.box, { roughness: 0.55 });
  const liningMaterial = useColorTween(colors.inner, { roughness: 0.9 });
  const ribbonMaterial = useColorTween(colors.ribbon, { roughness: 0.3, metalness: 0.25 });
  const { present, onExited } = useItemPresence(state.items);

  return (
    <group ref={popRef}>
      <group ref={giftRef}>
        <mesh
          geometry={createBaseGeometry(shape)}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <primitive object={boxMaterial} attach="material" />
        </mesh>
        <mesh
          geometry={createWallGeometry(shape)}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <primitive object={boxMaterial} attach="material" />
        </mesh>
        {/* The lining sits on the base (y 0.12). */}
        <mesh
          geometry={createFloorGeometry(shape)}
          position={[0, 0.12, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <primitive object={liningMaterial} attach="material" />
        </mesh>

        <FillerStrips shape={shape} active={state.filler} />

        {present.map((item) => (
          <ChocolateItem
            key={item.uid}
            item={item}
            slot={slots[item.slotIndex] ?? [0, 0]}
            filler={state.filler}
            onExited={onExited}
          />
        ))}

        <BoxLid
          shape={shape}
          boxMaterial={boxMaterial}
          ribbonMaterial={ribbonMaterial}
          pivotRef={lidRef}
          ribbonRef={ribbonRef}
          bowRef={bowRef}
        />
      </group>
    </group>
  );
}
