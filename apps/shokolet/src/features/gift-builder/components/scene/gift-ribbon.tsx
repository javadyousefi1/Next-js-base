import type { Ref } from "react";
import type { Group, Material } from "three";

import { BOX_SIZE, getBoxOutline, spanThroughCenter } from "../../geometry/box-outline";
import type { BoxShape } from "../../gift-builder.config";

/** Y of the lid top in the lid frame (the lid mesh sits 0.04 up for its bevel, which adds 0.04). */
export const LID_TOP = 0.04 + BOX_SIZE.lidHeight + 0.04;

const STRIP_WIDTH = 0.32;
const STRIP_THICKNESS = 0.03;
const END_HEIGHT = 0.3;

type GiftRibbonProps = {
  shape: BoxShape;
  material: Material;
  ribbonRef: Ref<Group>;
  bowRef: Ref<Group>;
};

/** Two crossing strips on the lid (with end pieces down its edge) and the bow on top. */
export function GiftRibbon({ shape, material, ribbonRef, bowRef }: GiftRibbonProps) {
  const lid = getBoxOutline(shape, BOX_SIZE.wallThickness + BOX_SIZE.lidOverhang);
  const [minX, maxX] = spanThroughCenter(lid, "x");
  const [minZ, maxZ] = spanThroughCenter(lid, "z");
  const stripY = LID_TOP + STRIP_THICKNESS / 2;
  const endY = LID_TOP - END_HEIGHT / 2 + STRIP_THICKNESS;

  return (
    <>
      <group ref={ribbonRef}>
        <mesh position={[(minX + maxX) / 2, stripY, 0]} castShadow>
          <boxGeometry args={[maxX - minX, STRIP_THICKNESS, STRIP_WIDTH]} />
          <primitive object={material} attach="material" />
        </mesh>
        <mesh position={[0, stripY + 0.004, (minZ + maxZ) / 2]} castShadow>
          <boxGeometry args={[STRIP_WIDTH, STRIP_THICKNESS, maxZ - minZ]} />
          <primitive object={material} attach="material" />
        </mesh>
        {[minX, maxX].map((x) => (
          <mesh key={`x${x}`} position={[x + Math.sign(x) * 0.035, endY, 0]}>
            <boxGeometry args={[STRIP_THICKNESS, END_HEIGHT, STRIP_WIDTH]} />
            <primitive object={material} attach="material" />
          </mesh>
        ))}
        {[minZ, maxZ].map((z) => (
          <mesh key={`z${z}`} position={[0, endY, z + Math.sign(z) * 0.035]}>
            <boxGeometry args={[STRIP_WIDTH, END_HEIGHT, STRIP_THICKNESS]} />
            <primitive object={material} attach="material" />
          </mesh>
        ))}
      </group>

      <group ref={bowRef} position={[0, LID_TOP + 0.03, 0]}>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.3, 0.2, 0]}
            rotation={[0, 0, -side * 0.5]}
            scale={[0.85, 1.1, 0.55]}
            castShadow
          >
            <torusGeometry args={[0.3, 0.08, 12, 28]} />
            <primitive object={material} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <primitive object={material} attach="material" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={`tail${side}`}
            position={[side * 0.16, 0.03, 0.3]}
            rotation={[0.1, side * 0.45, side * 0.15]}
            castShadow
          >
            <boxGeometry args={[0.13, 0.02, 0.55]} />
            <primitive object={material} attach="material" />
          </mesh>
        ))}
      </group>
    </>
  );
}
