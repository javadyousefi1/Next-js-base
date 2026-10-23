import { FILLER, type BoxShape } from "../../gift-builder.config";
import { useFillerFall } from "../../hooks/use-filler-fall";

type FillerStripsProps = {
  shape: BoxShape;
  active: boolean;
};

/** The colored paper straw: one instanced mesh, animated by `useFillerFall`. */
export function FillerStrips({ shape, active }: FillerStripsProps) {
  const ref = useFillerFall(shape, active);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, FILLER.stripCount]}
      visible={false}
      frustumCulled={false}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.42, 0.02, 0.06]} />
      <meshStandardMaterial roughness={0.7} />
    </instancedMesh>
  );
}
