"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

export const PROFILE_TABS = ["info", "identity", "documents"] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

const tabParser = parseAsStringLiteral(PROFILE_TABS)
  .withDefault("info")
  .withOptions({ history: "replace", clearOnDefault: true });

/** The active tab of the profile page, kept in the URL (`?tab=identity`). */
export function useProfileTab() {
  const [tab, setTab] = useQueryState("tab", tabParser);

  return { tab, selectTab: (value: unknown) => void setTab(tabParser.parse(String(value))) };
}
