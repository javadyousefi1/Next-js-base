"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { JalaliCalendar } from "@repo/ui/components/jalali-calendar";
import { JalaliDatePicker } from "@repo/ui/components/jalali-date-picker";
import { JalaliDateRangePicker } from "@repo/ui/components/jalali-date-range-picker";
import { Label } from "@repo/ui/components/label";
import { useTranslations } from "next-intl";

import { useCalendarShowcase } from "../hooks/use-calendar-showcase";
import { PickedDate } from "./picked-date";

export function CalendarShowcase() {
  const t = useTranslations("Calendar");
  const tPicker = useTranslations("DatePicker");
  const { pickerProps, ...showcase } = useCalendarShowcase();

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card className="lg:row-span-2">
        <CardHeader>
          <CardTitle>{t("calendar.title")}</CardTitle>
          <CardDescription>{t("calendar.description")}</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={showcase.selectToday}>
              {t("today")}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <JalaliCalendar
            {...pickerProps}
            captionLayout="dropdown"
            selected={showcase.day}
            onSelect={showcase.setDay}
            className="rounded-lg border"
          />
          <PickedDate value={showcase.dayText} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("datePicker.title")}</CardTitle>
          <CardDescription>{t("datePicker.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendar-date">{t("datePicker.label")}</Label>
            <div className="flex gap-2">
              <JalaliDatePicker
                {...pickerProps}
                id="calendar-date"
                placeholder={tPicker("placeholder")}
                value={showcase.date}
                onChange={showcase.setDate}
              />
              <Button variant="ghost" disabled={!showcase.date} onClick={showcase.clearDate}>
                {t("clear")}
              </Button>
            </div>
          </div>
          <PickedDate value={showcase.dateText} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("rangePicker.title")}</CardTitle>
          <CardDescription>{t("rangePicker.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendar-range">{t("rangePicker.label")}</Label>
            <div className="flex gap-2">
              <JalaliDateRangePicker
                {...pickerProps}
                id="calendar-range"
                placeholder={tPicker("rangePlaceholder")}
                value={showcase.range}
                onChange={showcase.setRange}
              />
              <Button variant="ghost" disabled={!showcase.range} onClick={showcase.clearRange}>
                {t("clear")}
              </Button>
            </div>
          </div>
          {showcase.rangeText ? (
            <div className="flex flex-col gap-3">
              <PickedDate value={showcase.rangeText.from} />
              <PickedDate value={showcase.rangeText.to} />
              <p className="text-sm">
                <span className="text-muted-foreground">{t("length")}: </span>
                <span className="font-medium">{showcase.rangeText.length}</span>
              </p>
            </div>
          ) : (
            <PickedDate value={undefined} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
