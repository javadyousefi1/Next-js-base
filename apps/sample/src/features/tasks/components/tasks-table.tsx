"use client";

import { DataTableProvider } from "@repo/table/data-table-context";
import { Button } from "@repo/ui/components/button";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { useTaskActions } from "../hooks/use-task-actions";
import { useTasksTable } from "../hooks/use-tasks-table";
import { TaskForm } from "./task-form";
import { useTasksColumns } from "./tasks-columns";
import { useTasksFilters } from "./tasks-filters";

export function TasksTable() {
  const t = useTranslations("Examples.data");
  const table = useTasksTable();
  const actions = useTaskActions({ Form: TaskForm });
  const columns = useTasksColumns(actions);
  const filters = useTasksFilters();

  return (
    <DataTableProvider
      table={table}
      columns={columns}
      filters={filters}
      searchPlaceholder={t("searchPlaceholder")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <DataTableToolbar />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={actions.refresh}>
              <RefreshCwIcon data-icon="inline-start" />
              {t("refresh")}
            </Button>
            <Button onClick={actions.create}>
              <PlusIcon data-icon="inline-start" />
              {t("newTask")}
            </Button>
          </div>
        </div>
        <DataTable />
        <DataTablePagination />
      </div>
    </DataTableProvider>
  );
}
