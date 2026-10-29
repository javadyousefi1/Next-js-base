import { AdminPulse } from "./admin-pulse";
import { GreetingHero } from "./greeting-hero";
import { MonthCalendarCard } from "./month-calendar-card";
import { QuickActionsCard } from "./quick-actions-card";
import { TodayCard } from "./today-card";

/** Management overview first, followed by the action workspace and a compact calendar. */
export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-6">
      <GreetingHero />
      <AdminPulse />
      <div className="grid min-w-0 gap-5 lg:col-span-4">
        <QuickActionsCard />
        <TodayCard />
      </div>
      <MonthCalendarCard />
    </div>
  );
}
