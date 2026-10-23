import "@/styles/globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import localFont from "next/font/local";

import { AppProviders } from "@/components/providers/app-providers";

// Self-hosted variable font (src/fonts): dev and build never download from Google Fonts.
const vazirmatn = localFont({
  src: "../fonts/vazirmatn-variable.woff2",
  weight: "100 900",
  variable: "--font-vazirmatn",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return { title: t("title"), description: t("description") };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
