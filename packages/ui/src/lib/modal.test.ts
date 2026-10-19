import { afterEach, describe, expect, test } from "bun:test";

import { modal, modalStore, resolveModalButton, type ModalEntry } from "./modal";

const last = (): ModalEntry => {
  const entry = modalStore.getSnapshot().at(-1);
  if (!entry) throw new Error("no modal is open");
  return entry;
};

/** Lets pending promise callbacks run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  for (const entry of modalStore.getSnapshot()) {
    modalStore.close(entry.id);
    modalStore.remove(entry.id);
  }
});

describe("modal.confirm", () => {
  test("resolves with the pressed button and closes", async () => {
    const answer = modal.confirm("Delete?", { title: "Delete", variant: "destructive" });
    const entry = last();
    expect(entry).toMatchObject({ kind: "confirm", content: "Delete?", open: true });

    await modalStore.answer(entry.id, "yes");
    expect(await answer).toBe("yes");
    expect(last().open).toBe(false); // closing animation; the host removes it afterwards
    modalStore.remove(entry.id);
    expect(modalStore.getSnapshot()).toHaveLength(0);
  });

  test("dismissing (Escape, outside click) answers no", async () => {
    const answer = modal.confirm("Sure?");
    modalStore.dismiss(last().id);
    expect(await answer).toBe("no");
  });

  test("onAction runs with the pressed button; the modal waits for it", async () => {
    const calls: string[] = [];
    const running = Promise.withResolvers<void>();
    const answer = modal.confirm("Activate?", {
      onAction: async (action) => {
        calls.push(action);
        await running.promise;
      },
    });
    const { id } = last();

    const pressing = modalStore.answer(id, "yes");
    expect(last()).toMatchObject({ pending: "yes", open: true });

    // While it runs, other buttons and dismissing are ignored.
    await modalStore.answer(id, "no");
    modalStore.dismiss(id);
    expect(calls).toEqual(["yes"]);

    running.resolve();
    await pressing;
    expect(await answer).toBe("yes");
  });

  test("onAction's return value becomes the answer", async () => {
    const answer = modal.confirm("Activate?", { onAction: async () => "no" });
    await modalStore.answer(last().id, "yes");
    expect(await answer).toBe("no");
  });

  test("an error in onAction keeps the modal open with the message; a retry can succeed", async () => {
    let attempts = 0;
    const answer = modal.confirm("Pay?", {
      onAction: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error("Payment failed");
        return "yes";
      },
    });
    const { id } = last();

    await modalStore.answer(id, "yes");
    expect(last()).toMatchObject({ open: true, pending: undefined, error: "Payment failed" });

    await modalStore.answer(id, "yes");
    expect(await answer).toBe("yes");
  });
});

describe("modal.alert", () => {
  test("resolves when closed or dismissed", async () => {
    const closed = modal.alert("Saved", { variant: "success" });
    modalStore.close(last().id);
    expect(await closed).toBeUndefined();

    const dismissed = modal.alert("Saved");
    modalStore.dismiss(last().id);
    expect(await dismissed).toBeUndefined();
  });
});

describe("modal.prompt", () => {
  test("resolves with the text, or null when cancelled", async () => {
    const named = modal.prompt("Name?");
    modalStore.submit(last().id, "Sara");
    expect(await named).toBe("Sara");

    const cancelled = modal.prompt("Name?");
    modalStore.dismiss(last().id);
    expect(await cancelled).toBeNull();
  });

  test("validate blocks the answer and shows its message", async () => {
    const answer = modal.prompt("Email?", {
      validate: (value) => (value.includes("@") ? undefined : "Not an email"),
    });
    const { id } = last();

    modalStore.submit(id, "nope");
    expect(last()).toMatchObject({ open: true, error: "Not an email" });

    modalStore.submit(id, "a@b.c");
    expect(await answer).toBe("a@b.c");
  });
});

describe("modal.open", () => {
  test("resolves with the value passed to close", async () => {
    const result = modal.open<{ id: number }>("form");
    modalStore.close(last().id, { id: 7 });
    expect(await result).toEqual({ id: 7 });
  });

  test("dismissing resolves undefined, unless it is not dismissible", async () => {
    const dismissed = modal.open("form");
    modalStore.dismiss(last().id);
    expect(await dismissed).toBeUndefined();

    let settled = false;
    const locked = modal.open<string>("form", { dismissible: false });
    void locked.then(() => (settled = true));
    const { id } = last();
    modalStore.dismiss(id);
    await flush();
    expect(settled).toBe(false);
    modalStore.close(id, "done");
    expect(await locked).toBe("done");
  });
});

describe("modalStore", () => {
  test("modals stack and notify subscribers; a resolved modal ignores later actions", async () => {
    let notified = 0;
    const unsubscribe = modalStore.subscribe(() => (notified += 1));

    const first = modal.confirm("first");
    const second = modal.alert("second");
    expect(modalStore.getSnapshot().map((entry) => entry.content)).toEqual(["first", "second"]);

    const [firstEntry, secondEntry] = modalStore.getSnapshot();
    modalStore.close(secondEntry!.id);
    await modalStore.answer(firstEntry!.id, "yes");
    await modalStore.answer(firstEntry!.id, "no"); // already answered
    expect(await first).toBe("yes");
    expect(await second).toBeUndefined();
    expect(notified).toBeGreaterThan(0);

    unsubscribe();
    const before = notified;
    void modal.alert("third");
    expect(notified).toBe(before);
  });

  test("remove only drops closed entries; the server snapshot is empty", () => {
    void modal.alert("open");
    const { id } = last();
    modalStore.remove(id);
    expect(last().id).toBe(id);
    expect(modalStore.getServerSnapshot()).toEqual([]);
  });
});

describe("resolveModalButton", () => {
  test("a string is the label; an object may set the type; missing parts fall back", () => {
    expect(resolveModalButton("Delete", "Confirm", "destructive")).toEqual({
      label: "Delete",
      type: "destructive",
    });
    expect(resolveModalButton({ type: "outline", label: "Later" }, "Cancel", "ghost")).toEqual({
      label: "Later",
      type: "outline",
    });
    expect(resolveModalButton(undefined, "OK", "default")).toEqual({
      label: "OK",
      type: "default",
    });
  });
});
