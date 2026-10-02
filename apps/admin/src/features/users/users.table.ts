import { defineDataTable } from "@/lib/table/define-data-table";

import { USER_ROLES, USER_SORT_FIELDS } from "./schemas/user.schema";

/** Users table: sortable columns + filters. Shared by the page (server) and `useUsersTable`. */
export const usersTable = defineDataTable({
  sortFields: USER_SORT_FIELDS,
  filters: { role: USER_ROLES },
});
