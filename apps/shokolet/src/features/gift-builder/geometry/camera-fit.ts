/**
 * Camera distance at which a sphere of `radius` fits the view on both axes. A portrait stage has
 * a narrower horizontal field of view than `fovDeg` (vertical), so it pushes the camera back.
 */
export function getFitDistance(aspect: number, fovDeg: number, radius: number): number {
  const halfVertical = (fovDeg * Math.PI) / 360;
  const halfHorizontal = Math.atan(Math.tan(halfVertical) * aspect);

  return radius / Math.sin(Math.min(halfVertical, halfHorizontal));
}
