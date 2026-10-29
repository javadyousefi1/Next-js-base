"use client";

import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";

import { useIdentityStatusLabel } from "@/features/users/hooks/use-identity-status-label";

import { statusTone } from "../status-tone";

/** An identity status as a coloured badge (`null`: no identity → "—"). */
export function IdentityStatusBadge({ status }: { status: number | null }) {
  const label = useIdentityStatusLabel();

  if (status === null) return "—";
  return <Badge className={cn("border-transparent", statusTone(status))}>{label(status)}</Badge>;
}
