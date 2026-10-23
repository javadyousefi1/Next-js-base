import { BOX_CAPACITY } from "./geometry/slots";
import {
  BOX_COLORS,
  BOXES,
  CHOCOLATES,
  FILLER,
  type BoxColorId,
  type BoxId,
  type ChocolateId,
} from "./gift-builder.config";

export type GiftItem = { uid: number; chocolateId: ChocolateId };

export type GiftState = {
  /** In insertion order: item i sits in slot i. */
  items: GiftItem[];
  nextUid: number;
  boxId: BoxId;
  colorId: BoxColorId;
  filler: boolean;
  /** The box is closed and tied with a ribbon: the content can't change. */
  wrapped: boolean;
};

export type GiftAction =
  | { type: "add"; chocolateId: ChocolateId }
  | { type: "remove"; chocolateId: ChocolateId }
  | { type: "setBox"; boxId: BoxId }
  | { type: "setColor"; colorId: BoxColorId }
  | { type: "toggleFiller" }
  | { type: "wrap" }
  | { type: "unwrap" }
  | { type: "reset" };

export const INITIAL_STATE: GiftState = {
  items: [],
  nextUid: 1,
  boxId: "classic",
  colorId: "cherry",
  filler: false,
  wrapped: false,
};

export function getCapacity(state: GiftState): number {
  return BOX_CAPACITY[state.boxId];
}

export function isFull(state: GiftState): boolean {
  return state.items.length >= getCapacity(state);
}

export function countsByChocolate(state: GiftState): Record<ChocolateId, number> {
  const counts = Object.fromEntries(CHOCOLATES.map((c) => [c.id, 0])) as Record<
    ChocolateId,
    number
  >;
  for (const item of state.items) counts[item.chocolateId] += 1;

  return counts;
}

export function getTotals(state: GiftState) {
  const chocolates = state.items.reduce(
    (sum, item) => sum + (CHOCOLATES.find((c) => c.id === item.chocolateId)?.price ?? 0),
    0,
  );
  const box = BOXES.find((b) => b.id === state.boxId)?.price ?? 0;
  const filler = state.filler ? FILLER.price : 0;

  return { chocolates, box, filler, total: chocolates + box + filler };
}

export function giftReducer(state: GiftState, action: GiftAction): GiftState {
  switch (action.type) {
    case "add": {
      if (state.wrapped || isFull(state)) return state;
      const item = { uid: state.nextUid, chocolateId: action.chocolateId };

      return { ...state, items: [...state.items, item], nextUid: state.nextUid + 1 };
    }
    case "remove": {
      if (state.wrapped) return state;
      const index = state.items.findLastIndex((item) => item.chocolateId === action.chocolateId);
      if (index === -1) return state;

      return { ...state, items: state.items.filter((_, i) => i !== index) };
    }
    case "setBox": {
      if (state.wrapped || state.items.length > BOX_CAPACITY[action.boxId]) return state;

      return { ...state, boxId: action.boxId };
    }
    case "setColor": {
      if (!BOX_COLORS.some((color) => color.id === action.colorId)) return state;

      return { ...state, colorId: action.colorId };
    }
    case "toggleFiller":
      return state.wrapped ? state : { ...state, filler: !state.filler };
    case "wrap":
      return state.items.length > 0 ? { ...state, wrapped: true } : state;
    case "unwrap":
      return { ...state, wrapped: false };
    case "reset":
    default:
      return INITIAL_STATE;
  }
}
