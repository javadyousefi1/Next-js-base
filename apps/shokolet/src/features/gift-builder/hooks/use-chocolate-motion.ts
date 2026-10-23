"use client";

import { useRef } from "react";
import type { Group } from "three";

import { BOX_SIZE } from "../geometry/box-outline";
import { gsap, useGSAP } from "../gsap";
import { useReducedMotion } from "./use-reduced-motion";

type ChocolateMotionOptions = {
  /** Slot position in the box. */
  x: number;
  z: number;
  /** Paper straw under the chocolate: it rests higher. */
  filler: boolean;
  leaving: boolean;
  onExited: () => void;
};

/** Enter (drop in), slot change, filler change and exit animations of one chocolate. */
export function useChocolateMotion({ x, z, filler, leaving, onExited }: ChocolateMotionOptions) {
  const ref = useRef<Group>(null);
  const entered = useRef(false);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const group = ref.current;
      if (!group) return undefined;
      const seconds = (value: number) => (reducedMotion ? 0 : value);
      const restY = filler ? BOX_SIZE.strawTop : BOX_SIZE.floorTop;
      const cleanup = () => {
        entered.current = false;
      };

      if (leaving) {
        gsap.to(group.position, {
          y: group.position.y + 1.2,
          duration: seconds(0.35),
          ease: "back.in",
        });
        gsap.to(group.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: seconds(0.35),
          ease: "back.in",
          onComplete: onExited,
        });
        return cleanup;
      }

      if (!entered.current) {
        entered.current = true;
        group.position.set(x, restY + 3.2, z);
        gsap.to(group.position, { y: restY, duration: seconds(0.8), ease: "bounce.out" });
        gsap.fromTo(
          group.rotation,
          { x: 0.5, z: -0.35 },
          { x: 0, z: 0, duration: seconds(0.8), ease: "power2.out" },
        );
        return cleanup;
      }

      gsap.to(group.position, {
        x,
        z,
        y: restY,
        duration: seconds(0.45),
        ease: "power2.out",
        overwrite: "auto",
      });
      return cleanup;
    },
    { dependencies: [x, z, filler, leaving, reducedMotion] },
  );

  return ref;
}
