import { OrbitControls } from "@react-three/drei";

import { CAMERA_TARGET, useFitCamera } from "../../hooks/use-fit-camera";

type CameraRigProps = {
  autoRotate: boolean;
};

/** Orbit controls around the gift; the zoom range follows the distance that fits the stage. */
export function CameraRig({ autoRotate }: CameraRigProps) {
  const distance = useFitCamera();

  return (
    <OrbitControls
      target={CAMERA_TARGET}
      enablePan={false}
      minDistance={distance * 0.65}
      maxDistance={distance * 1.3}
      minPolarAngle={0.35}
      maxPolarAngle={1.3}
      enableDamping
      autoRotate={autoRotate}
      autoRotateSpeed={1.2}
    />
  );
}
