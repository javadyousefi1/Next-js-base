import "@/styles/globals.css";
import { cn } from "@repo/ui/lib/utils";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import localFont from "next/font/local";

import { AppProviders } from "@/components/providers/app-providers";
import { SITE } from "@/config/site";
import { LOCALE_META } from "@/i18n/locales";
import { getLocaleParam } from "@/i18n/params";
import { routing } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";

// Self-hosted variable fonts (src/fonts): dev and build never download from Google Fonts, which
// silently falls back to Arial in dev — and fails the build — when Google is unreachable.
const roboto = localFont({
  src: "../../fonts/roboto-latin-variable.woff2",
  weight: "100 900",
  variable: "--font-roboto",
});
// RTL pages render all text in Vazirmatn (its Latin glyphs are Roboto's); loaded on demand.
// Order per direction: `--app-font` in styles/globals.css.
const vazirmatn = localFont({
  src: "../../fonts/vazirmatn-variable.woff2",
  weight: "100 900",
  variable: "--font-vazirmatn",
  preload: false,
});

/** Every locale is prerendered at build time (static shell + Cache Components). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  return rootMetadata(await getLocaleParam(params));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: SITE.themeColor.dark },
  ],
  colorScheme: "light dark",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await getLocaleParam(params);
  const { htmlLang, dir } = LOCALE_META[locale];

  return (
    <html
      lang={htmlLang}
      dir={dir}
      className={cn(roboto.variable, vazirmatn.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider>
          <AppProviders direction={dir}>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
