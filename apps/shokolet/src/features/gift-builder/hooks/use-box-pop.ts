"use client";

import { useRef } from "react";
import type { Group } from "three";

import { gsap, useGSAP } from "../gsap";
import { useReducedMotion } from "./use-reduced-motion";

/** Entrance of a new box: scales up and turns into place with an elastic ease. */
export function useBoxPop() {
  const ref = useRef<Group>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    const group = ref.current;
    if (!group || reducedMotion) return;

    gsap.fromTo(
      group.scale,
      { x: 0.6, y: 0.6, z: 0.6 },
      { x: 1, y: 1, z: 1, duration: 0.9, ease: "elastic.out(1, 0.6)" },
    );
    gsap.fromTo(group.rotation, { y: -0.6 }, { y: 0, duration: 0.9, ease: "elastic.out(1, 0.6)" });
  });

  return ref;
}
