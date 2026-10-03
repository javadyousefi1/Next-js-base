import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import plugin from "./index.ts";

// node:test returns promises; RuleTester expects plain callbacks.
RuleTester.describe = (text, fn) => void describe(text, fn);
RuleTester.it = (text, fn) => void it(text, fn);

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const { rules } = plugin;

tester.run("no-inline-query-keys", rules["no-inline-query-keys"]!, {
  valid: [
    "makeQuery({ key: QUERY_KEYS.users.list, params, response, fetcher })",
    "queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })",
    "invalidateKeys(queryClient, [QUERY_KEYS.users.all])",
  ],
  invalid: [
    { code: 'useQuery({ queryKey: ["users"], queryFn })', errors: 1 },
    { code: 'makeQuery({ key: (p) => ["users", p] })', errors: 1 },
    { code: 'invalidateKeys(queryClient, [["users"]])', errors: 1 },
  ],
});

tester.run("no-hardcoded-routes", rules["no-hardcoded-routes"]!, {
  valid: [
    "<Link href={ROUTES.users} />",
    '<a href="https://example.com" />',
    "router.push(ROUTES.dashboard)",
  ],
  invalid: [
    { code: '<Link href="/users" />', errors: 1 },
    { code: "<Link href={`/users/${id}`} />", errors: 1 },
    { code: 'router.replace("/login")', errors: 1 },
    { code: 'redirect("/")', errors: 1 },
  ],
});

tester.run("cn-for-conditional-classes", rules["cn-for-conditional-classes"]!, {
  valid: [
    '<div className="p-4" />',
    '<div className={cn("p-4", isActive && "bg-muted")} />',
    "<div className={styles.root} />",
  ],
  invalid: [
    { code: '<div className={isActive ? "a" : "b"} />', errors: 1 },
    { code: '<div className={isActive && "a"} />', errors: 1 },
    { code: "<div className={`p-4 ${extra}`} />", errors: 1 },
  ],
});

tester.run("no-logic-in-views", rules["no-logic-in-views"]!, {
  valid: ["const model = useUsersTable(); const t = useTranslations('Users');"],
  invalid: [
    { code: "const [open, setOpen] = useState(false);", errors: 1 },
    { code: "useEffect(() => {}, []);", errors: 1 },
    { code: "const query = useQuery(options);", errors: 1 },
    { code: 'import axios from "axios";', errors: 1 },
  ],
});

tester.run("no-server-import-in-client", rules["no-server-import-in-client"]!, {
  valid: [
    'import { getAccessToken } from "@/server/auth/cookies";',
    '"use client";\nimport { refresh } from "../server/dashboard.actions";',
    '"use client";\nimport type { TokenPair } from "@/server/auth/types";',
  ],
  invalid: [
    { code: '"use client";\nimport { redis } from "@/server/redis/client";', errors: 1 },
    { code: '"use client";\nimport { upstream } from "@/server/http/upstream";', errors: 1 },
  ],
});

tester.run("require-server-only", rules["require-server-only"]!, {
  valid: [
    'import "server-only";\nexport const x = 1;',
    '"use server";\nexport async function a() {}',
  ],
  invalid: [{ code: "export const x = 1;", errors: 1 }],
});

tester.run("no-process-env", rules["no-process-env"]!, {
  valid: ["process.env.NODE_ENV", "process.env.NEXT_RUNTIME", "env.API_BASE_URL"],
  invalid: [
    { code: "process.env.API_BASE_URL", errors: 1 },
    { code: "const { SECRET } = process.env;", errors: 1 },
  ],
});
