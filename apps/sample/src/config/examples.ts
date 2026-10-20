import {
  BlocksIcon,
  CalendarDaysIcon,
  DatabaseIcon,
  MessagesSquareIcon,
  LayersIcon,
  MessageSquareIcon,
  ServerIcon,
  ShieldCheckIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { ROUTES, type AppRoute } from "./routes";

export type Example = {
  /** Key in the `Nav` messages and the `Examples.<key>` namespace (title, description, texts). */
  key: "data" | "chat" | "modal" | "ui" | "jalali" | "hooks" | "access" | "redis";
  href: AppRoute;
  icon: LucideIcon;
  /** Workspace packages the page demonstrates. */
  packages: readonly `@repo/${string}`[];
};

/**
 * The sample app's showcase: every workspace package and cross-cutting feature has a working
 * example page here, so developers and AI agents copy real, tested code. A new package, module or
 * feature → show it in an example page and list the page here (AGENTS.md §6). `bun run check`
 * (`scripts/check-examples.ts`) fails while a package, a public module or an index export has no
 * example.
 */
export const EXAMPLES: readonly Example[] = [
  {
    key: "data",
    href: ROUTES.examplesData,
    icon: DatabaseIcon,
    packages: ["@repo/http", "@repo/query", "@repo/table"],
  },
  {
    key: "chat",
    href: ROUTES.examplesChat,
    icon: MessagesSquareIcon,
    packages: ["@repo/chat", "@repo/ui"],
  },
  { key: "modal", href: ROUTES.examplesModal, icon: MessageSquareIcon, packages: ["@repo/ui"] },
  { key: "ui", href: ROUTES.examplesUi, icon: BlocksIcon, packages: ["@repo/ui"] },
  {
    key: "jalali",
    href: ROUTES.examplesJalali,
    icon: CalendarDaysIcon,
    packages: ["@repo/jalali", "@repo/ui"],
  },
  { key: "hooks", href: ROUTES.examplesHooks, icon: WrenchIcon, packages: ["@repo/hooks"] },
  {
    key: "access",
    href: ROUTES.examplesAccess,
    icon: ShieldCheckIcon,
    packages: ["@repo/access"],
  },
  { key: "redis", href: ROUTES.examplesRedis, icon: ServerIcon, packages: ["@repo/redis"] },
];

/** Icon of the examples overview. */
export const EXAMPLES_ICON: LucideIcon = LayersIcon;
