import { AdminPulse } from "./admin-pulse";
import { GreetingHero } from "./greeting-hero";
import { MonthCalendarCard } from "./month-calendar-card";
import { NotesCard } from "./notes-card";
import { QuickActionsCard } from "./quick-actions-card";
import { TodayCard } from "./today-card";

/** The dashboard: hero and admin pulse on top, then a responsive grid of cards. */
export function DashboardContent() {
  return (
    <div className="flex flex-col gap-4">
      <GreetingHero />
      <AdminPulse />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TodayCard />
        <MonthCalendarCard />
        <QuickActionsCard />
        <div className="md:col-span-2 xl:col-span-3">
          <NotesCard />
        </div>
      </div>
    </div>
  );
}
