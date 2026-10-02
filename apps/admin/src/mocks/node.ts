import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/** MSW for the Next.js server process. Started from `src/instrumentation.ts`. */
export const server = setupServer(...handlers);
