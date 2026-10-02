"use client";

import { Button } from "@repo/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@repo/ui/components/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { USER_ROLES, type UserRole } from "../schemas/user.schema";

type UsersToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRole | null;
  onRoleChange: (role: UserRole | null) => void;
  hasFilters: boolean;
  onReset: () => void;
};

export function UsersToolbar(props: UsersToolbarProps) {
  const t = useTranslations("Users");
  const roleItems = [
    { value: null, label: t("allRoles") },
    ...USER_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupInput
          type="search"
          value={props.search}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          onChange={(event) => props.onSearchChange(event.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <Select items={roleItems} value={props.role} onValueChange={props.onRoleChange}>
        <SelectTrigger className="w-40" aria-label={t("roleFilter")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleItems.map((item) => (
            <SelectItem key={item.value ?? "all"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {props.hasFilters ? (
        <Button variant="ghost" onClick={props.onReset}>
          <XIcon data-icon="inline-start" />
          {t("resetFilters")}
        </Button>
      ) : null}
    </div>
  );
}
