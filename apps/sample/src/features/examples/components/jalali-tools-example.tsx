"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";
import { useTranslations } from "next-intl";

import { useJalaliToolsExample } from "../hooks/use-jalali-tools-example";
import { ConversionResult } from "./conversion-result";

/** Every `@repo/jalali` function: convert, validate, date math, format, digits, month grid. */
export function JalaliToolsExample() {
  const t = useTranslations("Examples.jalali");
  const tools = useJalaliToolsExample();

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("converter.title")}</CardTitle>
          <CardDescription>
            {t("converter.description")} {tools.range}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="gregorian-input">{t("converter.gregorian")}</Label>
            <Input
              id="gregorian-input"
              type="date"
              value={tools.gregorian.value}
              onChange={tools.gregorian.onChange}
            />
            <ConversionResult result={tools.gregorian.result} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="jalali-input">{t("converter.jalaliInput")}</Label>
            <Input
              id="jalali-input"
              dir="ltr"
              value={tools.jalali.value}
              onChange={tools.jalali.onChange}
            />
            <ConversionResult result={tools.jalali.result} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("math.title")}</CardTitle>
          <CardDescription>{t("math.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {tools.math ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="add-days">{t("math.days")}</Label>
                  <Input
                    id="add-days"
                    type="number"
                    value={tools.math.days.value}
                    onChange={tools.math.days.onChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="add-months">{t("math.months")}</Label>
                  <Input
                    id="add-months"
                    type="number"
                    value={tools.math.months.value}
                    onChange={tools.math.months.onChange}
                  />
                </div>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">{t("math.plusDays")}</dt>
                <dd>{tools.math.plusDays ?? "—"}</dd>
                <dt className="text-muted-foreground">{t("math.plusMonths")}</dt>
                <dd>{tools.math.plusMonths ?? "—"}</dd>
                <dt className="text-muted-foreground">{t("math.order")}</dt>
                <dd>{tools.math.order ?? "—"}</dd>
                <dt className="text-muted-foreground">{t("math.fromEpoch")}</dt>
                <dd>{tools.math.fromEpoch ?? "—"}</dd>
              </dl>
            </>
          ) : (
            <p className="text-sm text-destructive">{t("converter.invalid")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("grid.title")}</CardTitle>
          <CardDescription>{t("grid.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {tools.grid && (
            <table className="w-full text-center text-sm">
              <caption className="pb-2 font-medium">{tools.grid.title}</caption>
              <thead>
                <tr>
                  {tools.grid.weekdays.map((weekday) => (
                    <th key={weekday} scope="col" className="font-normal text-muted-foreground">
                      {weekday}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tools.grid.weeks.map((week) => (
                  <tr key={week.key}>
                    {week.days.map((day) => (
                      <td
                        key={day.key}
                        className={cn(
                          "py-1",
                          day.outside && "text-muted-foreground",
                          day.selected && "rounded-md bg-primary text-primary-foreground",
                        )}
                      >
                        {day.text}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("format.title")}</CardTitle>
          <CardDescription>{t("format.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("format.pattern")}</TableHead>
                <TableHead>{t("format.persian")}</TableHead>
                <TableHead>{t("format.english")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.formats.map((row) => (
                <TableRow key={row.pattern}>
                  <TableCell dir="ltr" className="font-mono text-xs">
                    {row.pattern}
                  </TableCell>
                  <TableCell dir="rtl">{row.fa}</TableCell>
                  <TableCell dir="ltr">{row.en}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="grid gap-2 md:grid-cols-3 md:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="digits-input">{t("format.digits")}</Label>
              <Input
                id="digits-input"
                value={tools.digits.value}
                onChange={tools.digits.onChange}
              />
            </div>
            <p className="text-sm">
              <span className="text-muted-foreground">{t("format.toPersian")}: </span>
              {tools.digits.persian}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">{t("format.toLatin")}: </span>
              {tools.digits.latin}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
