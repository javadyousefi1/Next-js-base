"use client";

import { modalStore, type ModalEntry } from "@repo/ui/lib/modal";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

/** The text field of a `modal.prompt`. */
export function useModalPrompt(entry: Extract<ModalEntry, { kind: "prompt" }>) {
  const [value, setValue] = useState(entry.options.defaultValue ?? "");
  /** Focused when the modal opens. */
  const inputRef = useRef<HTMLInputElement>(null);

  return {
    inputRef,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
    onSubmit: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      modalStore.submit(entry.id, value);
    },
  };
}
