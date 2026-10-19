import { useTranslations } from "next-intl";

type ConversionResultProps = {
  /** The converted date and facts about it; `undefined` = the input is not a valid date. */
  result:
    | {
        text: string;
        weekday: string | undefined;
        leap: string;
        monthLength: string;
        epochDay: string;
      }
    | undefined;
};

export function ConversionResult({ result }: ConversionResultProps) {
  const t = useTranslations("Examples.jalali.converter");
  if (!result) return <p className="text-sm text-destructive">{t("invalid")}</p>;

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <dt className="sr-only">{t("title")}</dt>
      <dd className="col-span-2 font-medium">{result.text}</dd>
      <dt className="text-muted-foreground">{t("weekday")}</dt>
      <dd>{result.weekday}</dd>
      <dt className="text-muted-foreground">{t("leap")}</dt>
      <dd>{result.leap}</dd>
      <dt className="text-muted-foreground">{t("monthLength")}</dt>
      <dd>{result.monthLength}</dd>
      <dt className="text-muted-foreground">{t("epochDay")}</dt>
      <dd>{result.epochDay}</dd>
    </dl>
  );
}
