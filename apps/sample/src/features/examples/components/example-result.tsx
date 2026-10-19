import { useTranslations } from "next-intl";

/** The last outcome of an example, announced to screen readers. */
export function ExampleResult({ value }: { value: string | undefined }) {
  const t = useTranslations("Examples");

  return (
    <p
      role="status"
      aria-label={t("result")}
      className="rounded-lg border bg-muted/40 px-3 py-2 text-sm"
    >
      <span className="text-muted-foreground">{t("result")}: </span>
      <span className="font-medium">{value ?? t("nothingYet")}</span>
    </p>
  );
}
