import "@/styles/globals.css";
import { cn } from "@repo/ui/lib/utils";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Roboto, Vazirmatn } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { SITE } from "@/config/site";
import { LOCALE_META } from "@/i18n/locales";
import { getLocaleParam } from "@/i18n/params";
import { routing } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";

const roboto = Roboto({ subsets: ["latin", "latin-ext"], variable: "--font-roboto" });
// RTL pages render all text in Vazirmatn (Latin too, hence the latin subset); loaded on demand.
// Order per direction: `--app-font` in styles/globals.css.
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
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
