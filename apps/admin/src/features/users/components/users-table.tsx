"use client";

import { DataTableView } from "@/components/data-table/data-table-view";

import { useUsersTable } from "../hooks/use-users-table";
import { usersColumns } from "./users-columns";

export function UsersTable() {
  return <DataTableView model={useUsersTable(usersColumns)} />;
}
