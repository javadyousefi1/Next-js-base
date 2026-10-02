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

import type { AppLocale } from "@/i18n/routing";

import { useLocaleSwitcher } from "../hooks/use-locale-switcher";
import { THEMES, useThemePreference, type ThemePreference } from "../hooks/use-theme-preference";

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
          onValueChange={([next]) => next && setTheme(next as ThemePreference)}
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
  const { locale, locales, switchTo } = useLocaleSwitcher();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          variant="outline"
          value={[locale]}
          onValueChange={([next]) => next && switchTo(next as AppLocale)}
        >
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
