"use client";

import { groupDocuments } from "../group-documents";
import type { ProfileIdentity } from "../schemas/profile.schema";

/** The identity's documents grouped by kind (empty groups when there is no identity). */
export function useProfileDocuments(identity: ProfileIdentity | null) {
  return groupDocuments(identity?.documents ?? []);
}
