"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@repo/ui/components/sidebar";
import { PanelsTopLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { UserMenu } from "@/features/auth/components/user-menu";
import { Link } from "@/i18n/navigation";

import { useNavItems } from "../hooks/use-nav-items";

type AppSidebarProps = {
  /** `right` for RTL locales. */
  side: "left" | "right";
};

export function AppSidebar({ side }: AppSidebarProps) {
  const t = useTranslations();
  const items = useNavItems();

  return (
    <Sidebar side={side} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={ROUTES.dashboard} />}>
              {/* shrink-0: the collapsed button is exactly this wide; the name is clipped, not the logo */}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <PanelsTopLeftIcon className="size-4" />
              </span>
              <span className="truncate font-semibold">{t("Common.appName")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Nav.main")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    tooltip={t(`Nav.${item.labelKey}`)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{t(`Nav.${item.labelKey}`)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
