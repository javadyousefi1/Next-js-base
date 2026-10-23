"use client";

import { useMemo, useRef } from "react";
import { Color, Object3D, type InstancedMesh } from "three";

import { getBoxOutline } from "../geometry/box-outline";
import { createFillerStrips } from "../geometry/filler-strips";
import { FILLER, type BoxShape } from "../gift-builder.config";
import { gsap, useGSAP } from "../gsap";
import { useReducedMotion } from "./use-reduced-motion";

const STRIP_SEED = 7;
const FALL_HEIGHT = 2.5;
const bounce = gsap.parseEase("bounce.out");
const dummy = new Object3D();

/**
 * The paper straw rains into the box when `active` and rises out when not. One progress value
 * 0 → 1 drives every strip: strip i starts at i / count × 0.55 and falls over 0.45 of it.
 */
export function useFillerFall(shape: BoxShape, active: boolean) {
  const ref = useRef<InstancedMesh>(null);
  const progress = useRef({ value: active ? 1 : 0 });
  const mounted = useRef(false);
  const reducedMotion = useReducedMotion();
  const strips = useMemo(
    () => createFillerStrips(getBoxOutline(shape, 0), FILLER.stripCount, STRIP_SEED),
    [shape],
  );

  const render = (value: number) => {
    const mesh = ref.current;
    if (!mesh) return;

    mesh.visible = value > 0;
    for (const [i, strip] of strips.entries()) {
      const start = (i / strips.length) * 0.55;
      const local = Math.min(1, Math.max(0, (value - start) / 0.45));
      dummy.position.set(strip.x, strip.y + (1 - bounce(local)) * FALL_HEIGHT, strip.z);
      dummy.rotation.set(strip.rotX, strip.rotY, strip.rotZ);
      dummy.scale.setScalar(local);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useGSAP(
    () => {
      const mesh = ref.current;
      if (!mesh) return undefined;

      if (!mounted.current) {
        mounted.current = true;
        for (const [i, strip] of strips.entries()) {
          mesh.setColorAt(i, new Color(FILLER.palette[strip.colorIndex]));
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        render(progress.current.value);
        return () => {
          mounted.current = false;
        };
      }

      gsap.to(progress.current, {
        value: active ? 1 : 0,
        duration: reducedMotion ? 0 : 1.1,
        ease: "none",
        overwrite: "auto",
        onUpdate: () => render(progress.current.value),
      });
      return undefined;
    },
    { dependencies: [active, reducedMotion] },
  );

  return ref;
}
