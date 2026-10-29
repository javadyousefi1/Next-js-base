import type { ProfileIdentity } from "@/features/profile/schemas/profile.schema";

/** The groups of the review sheet and the identity fields each shows (labels: `Profile.fields.*`). */
export const REVIEW_GROUPS = [
  { key: "professional", fields: ["specialty", "licenseNumber", "barAssociation", "bio"] },
  { key: "workplace", fields: ["province", "city"] },
  {
    key: "company",
    fields: [
      "companyName",
      "companyNationalId",
      "companyRegistrationNumber",
      "companyRepresentativeName",
    ],
  },
  { key: "nationalId", fields: ["nationalId"] },
] as const;

export type ReviewField = (typeof REVIEW_GROUPS)[number]["fields"][number];

/** The text of each field: the province / city come as names (looked up by the caller); `null` = empty. */
export function reviewFieldValues(
  identity: ProfileIdentity | null,
  names: { province: string | null; city: string | null },
): Record<ReviewField, string | null> {
  return {
    specialty: identity?.specialty ?? null,
    licenseNumber: identity?.licenseNumber ?? null,
    barAssociation: identity?.barAssociation ?? null,
    bio: identity?.bio ?? null,
    province: names.province,
    city: names.city,
    companyName: identity?.companyName ?? null,
    companyNationalId: identity?.companyNationalId ?? null,
    companyRegistrationNumber: identity?.companyRegistrationNumber ?? null,
    companyRepresentativeName: identity?.companyRepresentativeName ?? null,
    nationalId: identity?.nationalId ?? null,
  };
}

/** A document whose link is an image (shown as a thumbnail): by extension, or a `data:image` URL. */
export function isImageUrl(url: string | null): boolean {
  if (url === null) return false;
  return url.startsWith("data:image/") || /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(url);
}
