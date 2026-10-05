"use client";

import { useState } from "react";

/** The value from the previous render (React-docs pattern, no refs during render). */
export function usePrevious<T>(value: T): T | undefined {
  const [state, setState] = useState<{ current: T; previous: T | undefined }>({
    current: value,
    previous: undefined,
  });

  if (!Object.is(state.current, value)) {
    setState({ current: value, previous: state.current });
  }

  return state.previous;
}
