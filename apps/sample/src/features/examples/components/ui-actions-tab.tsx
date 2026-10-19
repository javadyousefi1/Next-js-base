"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Kbd, KbdGroup } from "@repo/ui/components/kbd";
import { Spinner } from "@repo/ui/components/spinner";
import { Toggle } from "@repo/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import {
  BoldIcon,
  ChevronDownIcon,
  ItalicIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  UnderlineIcon,
  UserIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useUiExample } from "../hooks/use-ui-example";
import { GallerySection } from "./gallery-section";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;
const BADGE_VARIANTS = ["default", "secondary", "outline", "destructive"] as const;

export function UiActionsTab() {
  const t = useTranslations("Examples.ui");
  const ui = useUiExample();

  return (
    <>
      <GallerySection title={t("buttons")}>
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        <Button size="sm">sm</Button>
        <Button size="lg">lg</Button>
        <Button size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button disabled>
          <Spinner data-icon="inline-start" />
          {t("loading")}
        </Button>
      </GallerySection>

      <GallerySection title={t("badges")}>
        {BADGE_VARIANTS.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </GallerySection>

      <GallerySection title={t("toggles")}>
        <Toggle aria-label={t("bold")}>
          <BoldIcon />
        </Toggle>
        <ToggleGroup variant="outline" multiple defaultValue={["italic"]}>
          <ToggleGroupItem value="italic" aria-label={t("italic")}>
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label={t("underline")}>
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {t("shortcut")}
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
      </GallerySection>

      <GallerySection title={t("menu")}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            {t("menu")}
            <ChevronDownIcon data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>admin@example.com</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserIcon />
                {t("menuItems.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                {t("menuItems.settings")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={ui.emailNotifications.checked}
              onCheckedChange={ui.emailNotifications.onCheckedChange}
            >
              {t("menuItems.notifications")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon />
              {t("menuItems.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </GallerySection>
    </>
  );
}
