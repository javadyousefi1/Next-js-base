"use client";

import { useRef } from "react";
import type { Group } from "three";

import { gsap, useGSAP } from "../gsap";
import { useReducedMotion } from "./use-reduced-motion";

/** Lid rotation (around the back edge) when the box is open: leans back, behind the box. */
export const LID_OPEN_ANGLE = -2.2;

/**
 * One paused timeline per box mount: the lid closes, the ribbon and the bow appear, then the whole
 * gift jumps and spins. `wrapped` plays it, un-wrapping reverses it.
 */
export function useWrapTimeline(wrapped: boolean) {
  const giftRef = useRef<Group>(null);
  const lidRef = useRef<Group>(null);
  const ribbonRef = useRef<Group>(null);
  const bowRef = useRef<Group>(null);
  const timelineRef = useRef<gsap.core.Timeline>(null);
  const initialized = useRef(false);
  const reducedMotion = useReducedMotion();

  // No dependencies: GSAP's hook then runs once per mount (the timeline is built once).
  useGSAP(() => {
    const gift = giftRef.current;
    const lid = lidRef.current;
    const ribbon = ribbonRef.current;
    const bow = bowRef.current;
    if (!gift || !lid || !ribbon || !bow) return;

    const seconds = (value: number) => (reducedMotion ? 0 : value);
    const timeline = gsap.timeline({ paused: true });

    timeline
      .fromTo(
        lid.rotation,
        { x: LID_OPEN_ANGLE },
        { x: 0, duration: seconds(0.7), ease: "power3.inOut" },
      )
      .fromTo(
        ribbon.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: seconds(0.35), ease: "power2.out" },
      )
      .fromTo(
        bow.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: seconds(0.6), ease: "back.out(3)" },
      )
      .addLabel("jump")
      .to(gift.position, { y: 0.5, duration: seconds(0.6), ease: "power2.out" }, "jump")
      .to(gift.position, { y: 0, duration: seconds(0.6), ease: "power2.in" }, ">")
      .fromTo(
        gift.rotation,
        { y: 0 },
        { y: Math.PI * 2, duration: seconds(1.2), ease: "power2.inOut" },
        "jump",
      );

    // Mounted already wrapped (a reset): jump to the right end without animating.
    timeline.progress(wrapped ? 1 : 0);
    timelineRef.current = timeline;
  });

  useGSAP(
    () => {
      const timeline = timelineRef.current;
      if (!timeline) return undefined;

      const cleanup = () => {
        initialized.current = false;
      };
      // The first run only syncs with the timeline built at mount (already at the right end).
      if (!initialized.current) {
        initialized.current = true;
        return cleanup;
      }
      if (wrapped) timeline.play();
      else timeline.reverse();

      return cleanup;
    },
    { dependencies: [wrapped] },
  );

  return { giftRef, lidRef, ribbonRef, bowRef };
}
