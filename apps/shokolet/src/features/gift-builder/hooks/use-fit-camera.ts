"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Vector3 } from "three";

import { getFitDistance } from "../geometry/camera-fit";

export const CAMERA_FOV = 40;
/** What the camera orbits: a bit above and behind the box center, toward the open lid. */
export const CAMERA_TARGET: [number, number, number] = [0, 1.3, -0.6];
/** Radius around the target that must stay in view: the box plus its open lid. */
const SCENE_RADIUS = 3.9;

/**
 * Keeps the camera (along its current direction) far enough that the whole gift fits the stage at
 * any aspect ratio, and returns that distance for the orbit limits.
 */
export function useFitCamera(): number {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / state.size.height);
  const distance = getFitDistance(aspect, CAMERA_FOV, SCENE_RADIUS);

  useEffect(() => {
    const target = new Vector3(...CAMERA_TARGET);
    const offset = camera.position.clone().sub(target).setLength(distance);
    camera.position.copy(target).add(offset);
  }, [camera, distance]);

  return distance;
}
