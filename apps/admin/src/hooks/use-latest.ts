"use client";

import { useRef, type RefObject } from "react";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/** Ref that always holds the latest value — read it inside stable callbacks/effects. */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
