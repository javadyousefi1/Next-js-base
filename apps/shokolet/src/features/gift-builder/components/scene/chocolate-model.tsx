import { RoundedBox } from "@react-three/drei";

import type { ChocolateModel as ChocolateKind } from "../../gift-builder.config";

type ChocolateModelProps = {
  model: ChocolateKind;
  colors: { wrapper: string; accent: string };
  /** Small rotation around Y so the chocolates don't look cloned. */
  yaw: number;
};

/** Wrapper foil look shared by every chocolate. */
function Wrapper({ color, metalness = 0.2 }: { color: string; metalness?: number }) {
  return <meshStandardMaterial color={color} roughness={0.35} metalness={metalness} />;
}

/** Stylized chocolate (origin at the bottom center). Which model: `config.model`. */
export function ChocolateModel({ model, colors, yaw }: ChocolateModelProps) {
  switch (model) {
    case "bar":
      return (
        <group rotation={[0, yaw, 0]}>
          <RoundedBox
            args={[0.82, 0.2, 0.42]}
            radius={0.07}
            position={[0, 0.1, 0]}
            castShadow
            receiveShadow
          >
            <Wrapper color={colors.wrapper} />
          </RoundedBox>
          <RoundedBox args={[0.28, 0.205, 0.425]} radius={0.03} position={[0, 0.1, 0]} castShadow>
            <Wrapper color={colors.accent} />
          </RoundedBox>
        </group>
      );
    case "kitkat":
      return (
        <group rotation={[0, yaw, 0]}>
          <RoundedBox
            args={[0.84, 0.18, 0.46]}
            radius={0.06}
            position={[0, 0.09, 0]}
            castShadow
            receiveShadow
          >
            <Wrapper color={colors.wrapper} />
          </RoundedBox>
          <mesh position={[0, 0.183, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.9, 1, 1]}>
            <circleGeometry args={[0.12, 24]} />
            <Wrapper color={colors.accent} />
          </mesh>
          {[-0.43, 0.43].map((x) => (
            <mesh key={x} position={[x, 0.09, 0]} castShadow>
              <boxGeometry args={[0.04, 0.19, 0.47]} />
              <meshStandardMaterial color="#c9ced6" roughness={0.25} metalness={0.8} />
            </mesh>
          ))}
        </group>
      );
    case "egg":
      return (
        <group rotation={[0, yaw, 0]} position={[0, 0.39, 0]} scale={[1, 1.3, 1]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <Wrapper color={colors.wrapper} />
          </mesh>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Wrapper color={colors.accent} />
          </mesh>
        </group>
      );
    case "snickers":
    default:
      return (
        <group rotation={[0, yaw, 0]}>
          <RoundedBox
            args={[0.84, 0.22, 0.38]}
            radius={0.07}
            position={[0, 0.11, 0]}
            castShadow
            receiveShadow
          >
            <Wrapper color={colors.wrapper} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.012, 0.2]} radius={0.005} position={[0, 0.222, 0]}>
            <Wrapper color={colors.accent} />
          </RoundedBox>
        </group>
      );
  }
}
