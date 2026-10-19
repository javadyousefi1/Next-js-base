"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useLocaleSwitcher } from "../hooks/use-locale-switcher";
import { THEMES, useThemePreference } from "../hooks/use-theme-preference";

const THEME_ICONS = { light: SunIcon, dark: MoonIcon, system: MonitorIcon };

export function AppearanceCard() {
  const t = useTranslations("Settings.appearance");
  const tTheme = useTranslations("Theme");
  const { theme, setTheme } = useThemePreference();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          variant="outline"
          value={theme ? [theme] : []}
          onValueChange={([next]) => setTheme(next)}
        >
          {THEMES.map((value) => {
            const Icon = THEME_ICONS[value];
            return (
              <ToggleGroupItem key={value} value={value}>
                <Icon />
                {tTheme(value)}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}

export function LanguageCard() {
  const t = useTranslations("Settings.language");
  const { canSwitch, locale, locales, switchTo } = useLocaleSwitcher();
  if (!canSwitch) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleGroup variant="outline" value={[locale]} onValueChange={([next]) => switchTo(next)}>
          {locales.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}
