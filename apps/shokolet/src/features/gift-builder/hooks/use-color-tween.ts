"use client";

import { useEffect, useState } from "react";
import { Color, MeshStandardMaterial, type MeshStandardMaterialParameters } from "three";

import { gsap, useGSAP } from "../gsap";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * A material that starts in `color` and tweens to every new `color` (GSAP on r/g/b).
 * Share it between meshes with `<primitive object={material} attach="material" />`.
 */
export function useColorTween(color: string, params: MeshStandardMaterialParameters) {
  const reducedMotion = useReducedMotion();
  const [material] = useState(() => new MeshStandardMaterial({ ...params, color }));

  useGSAP(
    () => {
      const target = new Color(color);
      gsap.to(material.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: reducedMotion ? 0 : 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    { dependencies: [color, reducedMotion] },
  );

  // The material is created here (not by JSX), so it is disposed here.
  useEffect(() => () => material.dispose(), [material]);

  return material;
}
