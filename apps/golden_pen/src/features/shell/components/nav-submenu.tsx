"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@repo/ui/components/sidebar";
import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { useNavSubmenu } from "../hooks/use-nav-submenu";
import type { ActiveNavParent } from "../nav-active";

/** A collapsible sidebar item with its links; open while one of them is the current page. */
export function NavSubmenu({ item }: { item: ActiveNavParent }) {
  const t = useTranslations("Nav");
  const submenu = useNavSubmenu(item.isActive);

  return (
    <Collapsible
      open={submenu.open}
      onOpenChange={submenu.onOpenChange}
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            isActive={item.isActive}
            tooltip={t(item.labelKey)}
            className="group/trigger"
          />
        }
      >
        <item.icon />
        <span>{t(item.labelKey)}</span>
        <ChevronDownIcon className="ms-auto transition-transform group-data-[panel-open]/trigger:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.children.map((child) => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton isActive={child.isActive} render={<Link href={child.href} />}>
                <child.icon />
                <span>{t(child.labelKey)}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
