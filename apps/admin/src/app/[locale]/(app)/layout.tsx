import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";

import { SessionWatcher } from "@/features/auth/components/session-watcher";
import { OfflineBanner } from "@/features/pwa/components/offline-banner";
import { AppHeader } from "@/features/shell/components/app-header";
import { AppSidebar } from "@/features/shell/components/app-sidebar";
import { getLocaleDirection } from "@/i18n/locales";
import { getLocaleParam } from "@/i18n/params";

/** Authenticated shell (the route guard lives in `src/proxy.ts`). */
export default async function AppLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await getLocaleParam(params);
  const side = getLocaleDirection(locale) === "rtl" ? "right" : "left";

  return (
    <SidebarProvider>
      <SessionWatcher />
      <AppSidebar side={side} />
      <SidebarInset>
        <AppHeader />
        <OfflineBanner />
        <main id="main-content" className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
