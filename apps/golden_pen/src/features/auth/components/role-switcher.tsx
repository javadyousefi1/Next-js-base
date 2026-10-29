"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { SidebarMenuButton } from "@repo/ui/components/sidebar";
import { UserCogIcon } from "lucide-react";

import { useRoleSwitcher } from "../hooks/use-role-switcher";

/** Sidebar footer: a super-admin tests the panel as another role (the server still sees the real one). */
export function RoleSwitcher() {
  const switcher = useRoleSwitcher();

  if (!switcher.visible) return null;

  return (
    <>
      <div className="grid gap-1 px-2 pb-1 group-data-[collapsible=icon]:hidden">
        <span className="text-xs text-muted-foreground" id="view-as-label">
          {switcher.label}
        </span>
        <Select items={switcher.items} value={switcher.value} onValueChange={switcher.onChange}>
          <SelectTrigger className="w-full" aria-labelledby="view-as-label">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {switcher.items.map((item) => (
              <SelectItem key={item.value ?? ""} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs leading-snug text-muted-foreground">{switcher.hint}</p>
      </div>
      <div className="hidden group-data-[collapsible=icon]:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton tooltip={switcher.label} aria-label={switcher.label} />}
          >
            <UserCogIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="min-w-48">
            <DropdownMenuLabel>{switcher.label}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={switcher.value ?? ""}
              onValueChange={(value) => switcher.onChange(value || null)}
            >
              {switcher.items.map((item) => (
                <DropdownMenuRadioItem key={item.value ?? ""} value={item.value ?? ""}>
                  {item.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
