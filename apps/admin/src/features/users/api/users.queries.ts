import { QUERY_KEYS } from "@/config/query-keys";
import { makeQuery } from "@/lib/query";

import { usersListParamsSchema } from "../schemas/user.schema";
import { usersListResponse } from "./users.backend";
import { fetchUsersList } from "./users.service";

export const usersListQuery = makeQuery({
  key: QUERY_KEYS.users.list,
  params: usersListParamsSchema,
  response: usersListResponse,
  fetcher: fetchUsersList,
  staleTime: 30_000,
});
