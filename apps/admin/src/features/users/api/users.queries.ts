import { QUERY_KEYS } from "@/config/query-keys";
import { makeQuery } from "@/lib/query";

import { usersListParamsSchema, usersListResponseSchema } from "../schemas/user.schema";
import { fetchUsersList } from "./users.service";

export const usersListQuery = makeQuery({
  name: "users.list",
  key: QUERY_KEYS.users.list,
  params: usersListParamsSchema,
  response: usersListResponseSchema,
  fetcher: fetchUsersList,
  staleTime: 30_000,
});
