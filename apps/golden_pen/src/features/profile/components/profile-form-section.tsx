import { FieldGroup } from "@repo/ui/components/field";
import type { ReactNode } from "react";

/** A titled group of fields in a 2-column grid (desktop). */
export function ProfileFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">{children}</FieldGroup>
    </section>
  );
}
