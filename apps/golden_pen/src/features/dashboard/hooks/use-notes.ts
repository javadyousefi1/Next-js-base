"use client";

import { useLocalStorage } from "@repo/hooks/use-local-storage";
import { toPersianDigits } from "@repo/jalali";
import { useTranslations } from "next-intl";
import { useState, type SubmitEvent } from "react";

import { notesSchema, type Note } from "../schemas/notes.schema";

const NO_NOTES: Note[] = [];
const MAX_NOTES = 50;

/** The notes card's model: a per-browser checklist in localStorage (empty when unavailable). */
export function useNotes() {
  const t = useTranslations("Dashboard.notes");
  const [notes, setNotes] = useLocalStorage("golden-pen:dashboard-notes", notesSchema, NO_NOTES);
  const [draft, setDraft] = useState("");

  const doneCount = notes.filter((note) => note.done).length;

  const save = (next: Note[]) => {
    try {
      setNotes(next);
    } catch {
      // Storage is full or blocked: the list simply stays as it was.
    }
  };

  return {
    notes,
    draft,
    setDraft,
    canAdd: draft.trim() !== "" && notes.length < MAX_NOTES,
    hasDone: doneCount > 0,
    summary: t("summary", {
      done: toPersianDigits(doneCount),
      total: toPersianDigits(notes.length),
    }),
    // A form submit, so Enter in the input adds too.
    add: (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = draft.trim();
      if (text === "" || notes.length >= MAX_NOTES) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      save([...notes, { id, text, done: false }]);
      setDraft("");
    },
    toggle: (id: string) =>
      save(notes.map((note) => (note.id === id ? { ...note, done: !note.done } : note))),
    remove: (id: string) => save(notes.filter((note) => note.id !== id)),
    clearDone: () => save(notes.filter((note) => !note.done)),
  };
}
