/** Static, non-translatable site configuration. Translatable copy lives in `messages/*.json`. */
export const SITE = {
  /** Used for the PWA manifest and as the `<title>` template fallback. */
  name: "Next.js Base Admin",
  shortName: "Admin",
  themeColor: { light: "#ffffff", dark: "#0a0a0a" },
} as const;
