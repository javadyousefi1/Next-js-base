import { getRequestConfig } from "next-intl/server";

/** Single-locale setup (no locale routing): every request is Persian. */
export default getRequestConfig(async () => ({
  locale: "fa",
  messages: (await import("../../messages/fa.json")).default,
  timeZone: "Asia/Tehran",
}));
