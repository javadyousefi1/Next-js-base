import { ContactShadows, Sparkles } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import type { GiftState } from "../../gift-builder.state";
import { CAMERA_FOV } from "../../hooks/use-fit-camera";
import { CameraRig } from "./camera-rig";
import { GiftBox } from "./gift-box";

type GiftSceneProps = {
  state: GiftState;
};

/**
 * The 3D stage. Everything is local (no HDR / network): lights, shadows, orbit camera.
 * Note: React context (next-intl…) does not reach inside the Canvas — pass props.
 */
export function GiftScene({ state }: GiftSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 6.6, 7.6], fov: CAMERA_FOV }}>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#fff1e0", "#d9a77c", 0.6]} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-bias={-0.0004}
      />
      <ContactShadows position={[0, -0.005, 0]} opacity={0.45} blur={2.5} scale={12} far={4} />

      <GiftBox key={state.boxId} state={state} />

      {state.wrapped && (
        <Sparkles
          count={40}
          scale={[5, 3, 4]}
          position={[0, 1.4, 0]}
          size={4}
          speed={0.6}
          color="#f2c14e"
        />
      )}

      <CameraRig autoRotate={state.wrapped} />
    </Canvas>
  );
}
