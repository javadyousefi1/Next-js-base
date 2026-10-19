/**
 * Promise-based modals, opened from anywhere (components, hooks, mutation callbacks) without a
 * per-page `open` state — like `toast()`. Mount `<ModalHost />` once; then:
 *
 *   const answer = await modal.confirm(<>Delete <b>{name}</b>?</>, {
 *     variant: "destructive",
 *     title: "Delete group",
 *     actionButton: { type: "destructive", label: "Delete" },
 *   });
 *   if (answer !== "yes") return;
 *
 * This file is the store (no React rendering): `modalStore` is what `<ModalHost />` reads.
 */
import type { ReactNode } from "react";

/** Colour and icon of confirm/alert/prompt modals. */
export type ModalVariant = "default" | "info" | "success" | "warning" | "destructive";

/** A `Button` variant for a modal button. */
export type ModalButtonType = "default" | "destructive" | "outline" | "secondary" | "ghost";

/** A button: its label, or its label and `Button` variant. */
export type ModalButton = string | { label: string; type?: ModalButtonType };

export type ConfirmAnswer = "yes" | "no";

type SharedOptions = {
  title?: ReactNode;
  variant?: ModalVariant;
};

export type ConfirmOptions = SharedOptions & {
  /** The "yes" button. Default: the host's `confirm` label. */
  actionButton?: ModalButton;
  /** The "no" button; `false` hides it. Default: the host's `cancel` label. */
  cancelButton?: ModalButton | false;
  /**
   * Async; runs when a button is pressed (`"no"` also for Escape). The buttons wait (spinner) until it
   * settles, then `confirm` resolves with what it returned (or the pressed button). If it throws,
   * the modal stays open and shows the error message. Mark a mutation used here `silent` to show
   * its error only in the modal.
   */
  onAction?: (action: ConfirmAnswer) => Promise<ConfirmAnswer | void>;
};

export type AlertOptions = SharedOptions & {
  /** Default: the host's `ok` label. */
  okButton?: ModalButton;
};

export type PromptOptions = SharedOptions & {
  /** Label of the input (default: none; the content describes it). */
  label?: ReactNode;
  placeholder?: string;
  defaultValue?: string;
  inputType?: "text" | "email" | "number" | "password" | "url";
  /** An error message blocks the answer and is shown under the input. */
  validate?: (value: string) => string | undefined;
  actionButton?: ModalButton;
  cancelButton?: ModalButton | false;
};

export type OpenOptions = {
  title?: ReactNode;
  description?: ReactNode;
  /** Max width. Default `"default"` (sm). */
  size?: "sm" | "default" | "lg" | "xl";
  /** Escape, a click outside and the ✕ close it (resolving `undefined`). Default `true`. */
  dismissible?: boolean;
};

type EntryState = {
  id: number;
  content: ReactNode;
  /** `false` while the closing animation runs; then the host removes the entry. */
  open: boolean;
  /** The confirm button whose `onAction` is running. */
  pending: ConfirmAnswer | undefined;
  /** Error of the last `onAction` or `validate`. */
  error: string | undefined;
};

export type ModalEntry =
  | (EntryState & { kind: "confirm"; options: ConfirmOptions })
  | (EntryState & { kind: "alert"; options: AlertOptions })
  | (EntryState & { kind: "prompt"; options: PromptOptions })
  | (EntryState & { kind: "custom"; options: OpenOptions });

type NewEntry = ModalEntry extends infer Entry
  ? Entry extends ModalEntry
    ? Omit<Entry, keyof EntryState>
    : never
  : never;

const NO_ENTRIES: readonly ModalEntry[] = [];
let entries: readonly ModalEntry[] = NO_ENTRIES;
let nextId = 1;
const listeners = new Set<() => void>();
const resolvers = new Map<number, (value: unknown) => void>();

function emit() {
  for (const listener of listeners) listener();
}

function find(id: number): ModalEntry | undefined {
  return entries.find((entry) => entry.id === id);
}

function patch(id: number, changes: Partial<EntryState>) {
  entries = entries.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry));
  emit();
}

function add<T>(entry: NewEntry, content: ReactNode): Promise<T> {
  return new Promise<T>((resolve) => {
    const id = nextId++;
    resolvers.set(id, resolve as (value: unknown) => void);
    const state: EntryState = { id, content, open: true, pending: undefined, error: undefined };
    entries = [...entries, { ...entry, ...state }];
    emit();
  });
}

/** Resolves the modal's promise and starts closing it. */
function settle(id: number, value: unknown) {
  const resolve = resolvers.get(id);
  if (!resolve) return;
  resolvers.delete(id);
  resolve(value);
  patch(id, { open: false, pending: undefined });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** A button spec completed with the host's label and the variant's button type. */
export function resolveModalButton(
  button: ModalButton | undefined,
  label: string,
  type: ModalButtonType,
): { label: string; type: ModalButtonType } {
  if (typeof button === "string") return { label: button, type };
  return { label: button?.label ?? label, type: button?.type ?? type };
}

/** Open a modal from anywhere; every method returns a promise of the user's answer. */
export const modal = {
  /** Yes/no question → `"yes"` | `"no"` (Escape = `"no"`). */
  confirm(content: ReactNode, options: ConfirmOptions = {}): Promise<ConfirmAnswer> {
    return add({ kind: "confirm", options }, content);
  },
  /** A message with one button; resolves when it is closed. */
  alert(content: ReactNode, options: AlertOptions = {}): Promise<void> {
    return add({ kind: "alert", options }, content);
  },
  /** Asks for a text → the text, or `null` when cancelled. */
  prompt(content: ReactNode, options: PromptOptions = {}): Promise<string | null> {
    return add({ kind: "prompt", options }, content);
  },
  /**
   * Any content (a form…). Inside it, `useModalClose<T>()` returns `close(value)`, which
   * resolves this promise; dismissing resolves `undefined`.
   */
  open<T = undefined>(content: ReactNode, options: OpenOptions = {}): Promise<T | undefined> {
    return add({ kind: "custom", options }, content);
  },
};

/** Used by `<ModalHost />` (and tests): the open modals and the user's actions. */
export const modalStore = {
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: (): readonly ModalEntry[] => entries,
  getServerSnapshot: (): readonly ModalEntry[] => NO_ENTRIES,

  /** A confirm button (or Escape → `"no"`): runs `onAction`, then resolves. */
  async answer(id: number, action: ConfirmAnswer): Promise<void> {
    const entry = find(id);
    if (entry?.kind !== "confirm" || !entry.open || entry.pending) return;
    const { onAction } = entry.options;
    if (!onAction) {
      settle(id, action);
      return;
    }
    patch(id, { pending: action, error: undefined });
    try {
      settle(id, (await onAction(action)) ?? action);
    } catch (error) {
      patch(id, { pending: undefined, error: errorMessage(error) });
    }
  },

  /** The prompt's submit: validates, then resolves with the text. */
  submit(id: number, value: string) {
    const entry = find(id);
    if (entry?.kind !== "prompt" || !entry.open) return;
    const error = entry.options.validate?.(value);
    if (error) patch(id, { error });
    else settle(id, value);
  },

  /** Closes a custom modal with a value (`useModalClose`) or an alert. */
  close(id: number, value?: unknown) {
    settle(id, value);
  },

  /** Escape, a click outside, ✕ or Cancel. Ignored while an `onAction` runs. */
  dismiss(id: number) {
    const entry = find(id);
    if (!entry?.open || entry.pending) return;
    if (entry.kind === "confirm") void modalStore.answer(id, "no");
    else if (entry.kind === "prompt") settle(id, null);
    else if (entry.kind === "alert") settle(id, undefined);
    else if (entry.options.dismissible !== false) settle(id, undefined);
  },

  /** Drops a closed entry once its closing animation has finished. */
  remove(id: number) {
    if (find(id)?.open !== false) return;
    entries = entries.filter((entry) => entry.id !== id);
    if (entries.length === 0) entries = NO_ENTRIES;
    emit();
  },
};
