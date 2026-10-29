import { z } from "zod";

/** The checklist stored in localStorage; an invalid stored value falls back to an empty list. */
export const noteSchema = z.object({
  id: z.string(),
  text: z.string().max(200),
  done: z.boolean(),
});
export type Note = z.infer<typeof noteSchema>;

export const notesSchema = z.array(noteSchema).max(50);
