/**
 * Seeded users of `GET /User/GetAll` (the back-office user list). Separate from `db.users`,
 * which are the accounts that can sign in.
 */
export type MockListedUser = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  username: string | null;
  avatarUrl: null;
  isActive: boolean;
  isPhoneNumberVerified: boolean;
  /** `null`: the user has no identity. */
  identity: { statusType: number; nationalCode: string } | null;
  roles: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

const NAMES = [
  "علی رضایی",
  "مریم احمدی",
  "حسین کریمی",
  "زهرا موسوی",
  "محمد حسینی",
  "فاطمه صادقی",
  "رضا نوری",
  "سارا جعفری",
  "امیر قاسمی",
  "نرگس یوسفی",
  "مهدی اکبری",
  "الهام رحیمی",
  "بهنام کاظمی",
  "پریسا شریفی",
  "کامران فرهادی",
  "لیلا ملکی",
  "سعید عباسی",
  "شیرین حیدری",
  "داود پاکزاد",
  "مینا زارعی",
  "یاسر طاهری",
  "آزاده منصوری",
  "پیمان صالحی",
  "ندا رستمی",
  "کیوان بابایی",
  "هستی کاویانی",
  "فرزاد انصاری",
] as const;

const ROLE_SETS: string[][] = [
  ["super-admin"],
  ["lawyer"],
  ["intern"],
  ["operator"],
  ["lawyer", "operator"],
  ["intern", "operator"],
  ["super-admin", "lawyer"],
];

/** `null` = no identity, otherwise `statusType` 0–5. */
const IDENTITY_STATUS_CYCLE = [null, 3, 1, 2, 3, 4, 5, 0, 3] as const;

export const mockListedUsers: MockListedUser[] = NAMES.map((fullName, index) => {
  const identityStatus = IDENTITY_STATUS_CYCLE[index % IDENTITY_STATUS_CYCLE.length] ?? null;
  const day = String((index % 28) + 1).padStart(2, "0");

  return {
    id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    fullName,
    phoneNumber: `0912${String(1000000 + index * 7919).slice(-7)}`,
    email: index % 4 === 0 ? null : `user${index + 1}@example.com`,
    username: index % 5 === 0 ? null : `user${index + 1}`,
    avatarUrl: null,
    isActive: index % 6 !== 5,
    isPhoneNumberVerified: index % 3 !== 2,
    identity:
      identityStatus === null
        ? null
        : { statusType: identityStatus, nationalCode: `00${String(10000000 + index)}` },
    roles: ROLE_SETS[index % ROLE_SETS.length] ?? [],
    createdAt: index % 7 === 3 ? null : `2025-03-${day}T09:30:00Z`,
    updatedAt: null,
  };
});
