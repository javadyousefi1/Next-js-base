/**
 * Static catalog of the gift builder: edit prices (Toman), colors and box layouts here.
 * Names and descriptions live in `messages/fa.json` (`chocolates.<id>`, `boxes.<id>`, `colors.<id>`).
 */

/**
 * The 3D chocolates are stylized look-alikes (no logos, no trademarks); the `colors` are free to
 * edit. `model` picks the shape drawn in `components/scene/chocolate-model.tsx`.
 */
export const CHOCOLATES = [
  {
    id: "hobby",
    price: 35_000,
    model: "bar",
    colors: { wrapper: "#e8862a", accent: "#5a2d0c" },
  },
  {
    id: "kitkat",
    price: 65_000,
    model: "kitkat",
    colors: { wrapper: "#d6001c", accent: "#ffffff" },
  },
  {
    id: "kinder",
    price: 80_000,
    model: "egg",
    colors: { wrapper: "#ffffff", accent: "#ff5a1f" },
  },
  {
    id: "snickers",
    price: 60_000,
    model: "snickers",
    colors: { wrapper: "#4b2a1a", accent: "#1f5aa6" },
  },
] as const satisfies readonly {
  id: string;
  price: number;
  model: "bar" | "kitkat" | "egg" | "snickers";
  colors: { wrapper: string; accent: string };
}[];

/** Box shapes; the capacity is derived from the slot layout (`geometry/slots.ts`). */
export const BOXES = [
  { id: "classic", shape: "rect", price: 90_000 },
  { id: "heart", shape: "heart", price: 140_000 },
  { id: "round", shape: "circle", price: 110_000 },
] as const satisfies readonly { id: string; shape: "rect" | "heart" | "circle"; price: number }[];

/** Box color schemes: outer shell, inner lining and ribbon/bow. */
export const BOX_COLORS = [
  { id: "cherry", box: "#8e1b2e", inner: "#f6d6c8", ribbon: "#f2c14e" },
  { id: "navy", box: "#1f2a4d", inner: "#e9dfc8", ribbon: "#e6b655" },
  { id: "blush", box: "#f2b8c6", inner: "#fff4f6", ribbon: "#b5174a" },
  { id: "cream", box: "#efe3cf", inner: "#7a4a2b", ribbon: "#8e1b2e" },
] as const satisfies readonly { id: string; box: string; inner: string; ribbon: string }[];

/** Colored paper straw ("pushal") laid under the chocolates. */
export const FILLER = {
  price: 25_000,
  palette: ["#ff6b9a", "#ffd23f", "#3bceac", "#7b5cff", "#ff9f1c", "#4cc9f0"],
  stripCount: 280,
} as const;

export type ChocolateId = (typeof CHOCOLATES)[number]["id"];
export type ChocolateModel = (typeof CHOCOLATES)[number]["model"];
export type BoxId = (typeof BOXES)[number]["id"];
export type BoxShape = (typeof BOXES)[number]["shape"];
export type BoxColorId = (typeof BOX_COLORS)[number]["id"];
