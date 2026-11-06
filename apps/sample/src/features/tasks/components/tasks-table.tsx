"use client";

import { Button } from "@repo/ui/components/button";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTableView } from "@/components/data-table/data-table-view";

import { useTaskActions } from "../hooks/use-task-actions";
import { useTasksTable } from "../hooks/use-tasks-table";
import { TaskForm } from "./task-form";
import { useTasksColumns } from "./tasks-columns";
import { useTasksFilters } from "./tasks-filters";

export function TasksTable() {
  const t = useTranslations("Examples.data");
  const actions = useTaskActions({ Form: TaskForm });

  return (
    <DataTableView
      table={useTasksTable()}
      columns={useTasksColumns(actions)}
      filters={useTasksFilters()}
      searchPlaceholder={t("searchPlaceholder")}
      actions={
        <>
          <Button variant="outline" onClick={actions.refresh}>
            <RefreshCwIcon data-icon="inline-start" />
            {t("refresh")}
          </Button>
          <Button onClick={actions.create}>
            <PlusIcon data-icon="inline-start" />
            {t("newTask")}
          </Button>
        </>
      }
    />
  );
}
