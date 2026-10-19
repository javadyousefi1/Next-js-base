import { faker } from "@faker-js/faker/locale/en";

/**
 * In-memory fake database for MSW (development + e2e only).
 * Seeded, so every run produces the same users (stable e2e assertions).
 */
faker.seed(42);

export const USER_ROLES = ["admin", "moderator", "user"] as const;
export type MockUserRole = (typeof USER_ROLES)[number];

export type MockUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  age: number;
  role: MockUserRole;
  company: { name: string; title: string };
};

/** Demo logins: an admin (every permission) and a member (role `user`: no users access). */
export const DEMO_ACCOUNTS = {
  admin: { username: "admin", password: "admin123" },
  member: { username: "member", password: "member123" },
} as const;

function createUser(id: number): MockUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id,
    firstName,
    lastName,
    username: faker.internet.username({ firstName, lastName }).toLowerCase(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: "international" }),
    age: faker.number.int({ min: 18, max: 70 }),
    role: faker.helpers.weightedArrayElement([
      { weight: 1, value: "admin" },
      { weight: 3, value: "moderator" },
      { weight: 8, value: "user" },
    ]),
    company: { name: faker.company.name(), title: faker.person.jobTitle() },
  };
}

const adminUser: MockUser = {
  id: 1,
  firstName: "Admin",
  lastName: "User",
  username: DEMO_ACCOUNTS.admin.username,
  email: "admin@example.com",
  phone: "+1 555 0100",
  age: 34,
  role: "admin",
  company: { name: "Acme", title: "Administrator" },
};

const memberUser: MockUser = {
  id: 2,
  firstName: "Member",
  lastName: "User",
  username: DEMO_ACCOUNTS.member.username,
  email: "member@example.com",
  phone: "+1 555 0101",
  age: 28,
  role: "user",
  company: { name: "Acme", title: "Support" },
};

export const TASK_STATUSES = ["todo", "doing", "done"] as const;

/** Backend shape (snake_case) of the tasks example API. */
export type MockTask = {
  id: number;
  title: string;
  status: (typeof TASK_STATUSES)[number];
  due_date: string | null;
  created_at: string;
};

/** Fixed dates (not "now") keep the seeded tasks identical on every run. */
const TASKS_EPOCH = Date.UTC(2026, 0, 1);
const DAY_MS = 86_400_000;

function createTask(id: number): MockTask {
  const verb = faker.hacker.verb();
  const dueInDays = faker.number.int({ min: -20, max: 120 });
  return {
    id,
    title: `${verb[0]?.toUpperCase()}${verb.slice(1)} the ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    status: faker.helpers.weightedArrayElement([
      { weight: 3, value: "todo" },
      { weight: 2, value: "doing" },
      { weight: 2, value: "done" },
    ]),
    due_date: faker.datatype.boolean({ probability: 0.8 })
      ? new Date(TASKS_EPOCH + dueInDays * DAY_MS).toISOString().slice(0, 10)
      : null,
    created_at: new Date(TASKS_EPOCH - id * DAY_MS).toISOString(),
  };
}

type Session = { userId: number; expiresAt: number };

export const db = {
  users: [
    adminUser,
    memberUser,
    ...Array.from({ length: 56 }, (_, index) => createUser(index + 3)),
  ],
  tasks: Array.from({ length: 26 }, (_, index) => createTask(index + 1)),
  accessTokens: new Map<string, Session>(),
  refreshTokens: new Map<string, Session>(),
};
