import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Use these instead of `next/link` / `next/navigation`
 * (lint: `no-restricted-imports`). Pass pathnames from `ROUTES`, never string literals.
 */
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
