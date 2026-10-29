/**
 * In-memory invite links of `GET /User/InviteLink/GetAll` and `POST /User/InviteLink/Create`
 * (development + e2e only). A created link is added here, so it shows up in the list.
 */
export type MockInviteLink = {
  id: string;
  token: string;
  inviteUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  expiresAt: string;
  usedAt: string | null;
  usedByUserId: string | null;
  isValid: boolean;
  createdAt: string | null;
};

const DAY_MS = 86_400_000;
const INVITE_BASE_URL = "http://localhost:3002/register?invite=";

export const DEFAULT_EXPIRES_IN_DAYS = 7;

export const inviteUrlOf = (token: string) => `${INVITE_BASE_URL}${token}`;

const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString();

/** `valid` = unused and not expired; `used` = redeemed; `expired` = unused and past its date. */
type Kind = "valid" | "used" | "expired";

const SEED: { firstName: string; lastName: string; kind: Kind }[] = [
  { firstName: "علی", lastName: "رضایی", kind: "valid" },
  { firstName: "مریم", lastName: "احمدی", kind: "valid" },
  { firstName: "حسین", lastName: "کریمی", kind: "used" },
  { firstName: "زهرا", lastName: "موسوی", kind: "valid" },
  { firstName: "محمد", lastName: "حسینی", kind: "expired" },
  { firstName: "فاطمه", lastName: "صادقی", kind: "valid" },
  { firstName: "رضا", lastName: "نوری", kind: "used" },
  { firstName: "سارا", lastName: "جعفری", kind: "valid" },
  { firstName: "امیر", lastName: "قاسمی", kind: "expired" },
  { firstName: "نرگس", lastName: "باقری", kind: "valid" },
  { firstName: "داود", lastName: "طاهری", kind: "used" },
  { firstName: "الهام", lastName: "فرهادی", kind: "expired" },
];

function seedLink(entry: (typeof SEED)[number], index: number): MockInviteLink {
  const token = `seed-token-${index + 1}`;
  const createdDaysAgo = index + 1;
  return {
    id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    token,
    inviteUrl: inviteUrlOf(token),
    firstName: entry.firstName,
    lastName: entry.lastName,
    phoneNumber: `0913000${String(1000 + index)}`,
    expiresAt: daysFromNow(entry.kind === "expired" ? -1 : 5),
    usedAt: entry.kind === "used" ? daysFromNow(-createdDaysAgo + 0.5) : null,
    usedByUserId:
      entry.kind === "used"
        ? `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
        : null,
    isValid: entry.kind === "valid",
    createdAt: daysFromNow(-createdDaysAgo),
  };
}

/** Newest first. 12 links: 6 valid, 3 used, 3 expired. */
export const mockInviteLinks: MockInviteLink[] = SEED.map(seedLink);
