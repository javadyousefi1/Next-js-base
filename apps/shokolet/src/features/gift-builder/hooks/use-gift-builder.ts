"use client";

import { useTranslations } from "next-intl";
import { useReducer } from "react";
import { toast } from "sonner";

import { BOX_CAPACITY } from "../geometry/slots";
import { BOXES, type BoxColorId, type BoxId, type ChocolateId } from "../gift-builder.config";
import {
  countsByChocolate,
  getCapacity,
  getTotals,
  giftReducer,
  INITIAL_STATE,
  isFull,
} from "../gift-builder.state";

/** The gift builder model: state, derived values and bound actions. */
export function useGiftBuilder() {
  const t = useTranslations();
  const [state, dispatch] = useReducer(giftReducer, INITIAL_STATE);

  return {
    state,
    counts: countsByChocolate(state),
    capacity: getCapacity(state),
    isFull: isFull(state),
    totals: getTotals(state),
    /** Box choices; a box the current chocolates don't fit in can't be picked. */
    boxOptions: BOXES.map((box) => ({
      id: box.id,
      price: box.price,
      capacity: BOX_CAPACITY[box.id],
      fits: state.items.length <= BOX_CAPACITY[box.id],
    })),
    canWrap: state.items.length > 0,
    addChocolate: (chocolateId: ChocolateId) => dispatch({ type: "add", chocolateId }),
    removeChocolate: (chocolateId: ChocolateId) => dispatch({ type: "remove", chocolateId }),
    setBox: (boxId: BoxId) => dispatch({ type: "setBox", boxId }),
    setColor: (colorId: BoxColorId) => dispatch({ type: "setColor", colorId }),
    toggleFiller: () => dispatch({ type: "toggleFiller" }),
    wrap: () => dispatch({ type: "wrap" }),
    unwrap: () => dispatch({ type: "unwrap" }),
    reset: () => dispatch({ type: "reset" }),
    placeOrder: () => {
      toast.success(t("order.success"));
    },
  };
}

export type GiftBuilderModel = ReturnType<typeof useGiftBuilder>;
