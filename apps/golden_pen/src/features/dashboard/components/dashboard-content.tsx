import { AdminPulse } from "./admin-pulse";
import { GreetingHero } from "./greeting-hero";
import { MonthCalendarCard } from "./month-calendar-card";
import { QuickActionsCard } from "./quick-actions-card";
import { TodayCard } from "./today-card";

/** The dashboard: hero, three stat cards, calendar and today side by side, then the quick actions. */
export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
      <GreetingHero />
      <AdminPulse />
      <MonthCalendarCard />
      <TodayCard />
      <QuickActionsCard />
    </div>
  );
}
