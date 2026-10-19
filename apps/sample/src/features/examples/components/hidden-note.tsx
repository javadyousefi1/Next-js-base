import { EyeOffIcon } from "lucide-react";

/** What a `<Can fallback>` shows instead of the hidden content. */
export function HiddenNote({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <EyeOffIcon className="size-4" />
      {text}
    </p>
  );
}
