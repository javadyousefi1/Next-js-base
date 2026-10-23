import type { Ref } from "react";
import type { Group, Material } from "three";

import { BOX_SIZE, getBoxOutline, polygonBounds } from "../../geometry/box-outline";
import { createLidGeometry } from "../../geometry/three-shapes";
import type { BoxShape } from "../../gift-builder.config";
import { GiftRibbon } from "./gift-ribbon";

type BoxLidProps = {
  shape: BoxShape;
  boxMaterial: Material;
  ribbonMaterial: Material;
  pivotRef: Ref<Group>;
  ribbonRef: Ref<Group>;
  bowRef: Ref<Group>;
};

/** The lid, hinged at the back edge, carrying the ribbon and the bow. */
export function BoxLid({
  shape,
  boxMaterial,
  ribbonMaterial,
  pivotRef,
  ribbonRef,
  bowRef,
}: BoxLidProps) {
  // The back edge of the outer wall (smallest z) is the hinge.
  const backZ = polygonBounds(getBoxOutline(shape, BOX_SIZE.wallThickness)).minZ;

  return (
    <group ref={pivotRef} position={[0, BOX_SIZE.wallHeight, backZ]}>
      <group position={[0, 0, -backZ]}>
        {/* y 0.04: the lid's bevel extends below its extrusion start. */}
        <mesh
          geometry={createLidGeometry(shape)}
          position={[0, 0.04, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <primitive object={boxMaterial} attach="material" />
        </mesh>
        <GiftRibbon shape={shape} material={ribbonMaterial} ribbonRef={ribbonRef} bowRef={bowRef} />
      </group>
    </group>
  );
}
