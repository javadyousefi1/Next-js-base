/**
 * In-memory fake database for MSW (development + e2e only): the users of the back-office API.
 * Restarting the server resets it.
 */
import { seededIdentity, type MockIdentity } from "./profile-data";

export type MockUser = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  /** `null`: registered with a phone only (signs in with an SMS code). */
  password: string | null;
  isPhoneNumberVerified: boolean;
  roles: string[];
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  /** `null`: no identity yet (created on the first identity update or document upload). */
  identity: MockIdentity | null;
};

/** Demo login (password): the seeded admin. */
export const DEMO_ACCOUNT = { phoneNumber: "09120000000", password: "admin123" } as const;

/** The SMS code of every phone number in the mock. */
export const MOCK_OTP_CODE = "123456";

export const db = {
  users: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      firstName: "مدیر",
      lastName: "سیستم",
      phoneNumber: DEMO_ACCOUNT.phoneNumber,
      password: DEMO_ACCOUNT.password,
      isPhoneNumberVerified: true,
      roles: ["Admin"],
      email: null,
      username: null,
      avatarUrl: null,
      identity: seededIdentity(),
    },
  ] as MockUser[],
};
