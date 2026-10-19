import { useTranslations } from "next-intl";

type PickedDateProps = {
  /** A picked date in both calendars; nothing picked → the empty text. */
  value: { jalali: string; gregorian: string } | undefined;
};

export function PickedDate({ value }: PickedDateProps) {
  const t = useTranslations("Calendar");
  if (!value) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <dt className="text-muted-foreground">{t("jalali")}</dt>
      <dd className="font-medium">{value.jalali}</dd>
      <dt className="text-muted-foreground">{t("gregorian")}</dt>
      <dd>{value.gregorian}</dd>
    </dl>
  );
}
