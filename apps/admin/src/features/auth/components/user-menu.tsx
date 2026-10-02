"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { SidebarMenuButton } from "@repo/ui/components/sidebar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { LogOutIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useCurrentUser } from "../hooks/use-current-user";
import { useLogout } from "../hooks/use-logout";

export function UserMenu() {
  const t = useTranslations("Nav");
  const { user, initials, fullName } = useCurrentUser();
  const { logout, isLoggingOut } = useLogout();

  if (!user) return <Skeleton className="h-12 w-full" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" aria-label={t("account")} />}>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-start text-sm leading-tight">
          <span className="truncate font-medium">{fullName}</span>
          <span className="text-muted-foreground truncate text-xs">{user.email}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isLoggingOut} onClick={logout}>
          <LogOutIcon />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
