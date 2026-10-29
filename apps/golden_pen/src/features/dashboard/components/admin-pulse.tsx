"use client";

import { useAdminPulse } from "../hooks/use-admin-pulse";
import { StatCard } from "./stat-card";

/** The useful part: live counts of users, pending identity requests and unused invite links. */
export function AdminPulse() {
  const cards = useAdminPulse();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <StatCard
          key={card.id}
          label={card.label}
          value={card.value}
          isError={card.isError}
          onRetry={card.retry}
          href={card.href}
        />
      ))}
    </div>
  );
}
