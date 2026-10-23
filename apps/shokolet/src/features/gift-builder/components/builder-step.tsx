import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { useFormatter } from "next-intl";
import type { ReactNode } from "react";

type BuilderStepProps = {
  index: number;
  title: string;
  /** Dimmed while the box is wrapped (the content can't change). */
  disabled?: boolean;
  children: ReactNode;
};

/** One numbered section of the builder panel. */
export function BuilderStep({ index, title, disabled = false, children }: BuilderStepProps) {
  const format = useFormatter();

  return (
    <Card className={cn("bg-card/80 backdrop-blur", disabled && "opacity-60")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="bg-cocoa text-cream grid size-6 place-items-center rounded-full text-xs">
            {format.number(index)}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
