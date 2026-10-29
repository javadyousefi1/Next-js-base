"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useNotes } from "../hooks/use-notes";

/** Small per-browser checklist: add (Enter), tick, delete, clear the done ones. */
export function NotesCard() {
  const t = useTranslations("Dashboard.notes");
  const notes = useNotes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription data-testid="notes-summary">{notes.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form onSubmit={notes.add} className="flex gap-2">
          <Input
            aria-label={t("placeholder")}
            placeholder={t("placeholder")}
            maxLength={200}
            value={notes.draft}
            onChange={(event) => notes.setDraft(event.target.value)}
          />
          <Button type="submit" disabled={!notes.canAdd}>
            {t("add")}
          </Button>
        </form>
        {notes.notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul aria-label={t("list")} className="flex flex-col gap-1">
            {notes.notes.map((note) => (
              <li
                key={note.id}
                className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/50"
              >
                <Checkbox
                  checked={note.done}
                  aria-label={note.text}
                  onCheckedChange={() => notes.toggle(note.id)}
                />
                <span
                  className={cn(
                    "flex-1 text-sm break-words",
                    note.done && "text-muted-foreground line-through",
                  )}
                >
                  {note.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t("remove")}: ${note.text}`}
                  onClick={() => notes.remove(note.id)}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {notes.hasDone ? (
          <Button variant="outline" size="sm" className="self-start" onClick={notes.clearDone}>
            {t("clearDone")}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
