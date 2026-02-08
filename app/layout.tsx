import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ConsentAnalytics } from "@/components/consent-analytics";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

import { LocaleProvider } from "@/components/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { COOKIE_CONSENT_COOKIE_KEY, parseCookieConsent } from "@/lib/cookie-consent";
import { getLocale as getServerLocale } from "@/lib/i18n-server";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/site.webmanifest",
  title: {
    default: "DemumuMind MCP",
    template: "%s | DemumuMind MCP",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/demumumind-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon-32x32.png"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  description:
    "A community-curated directory of MCP servers for Claude, OpenAI, and AI agents.",
  keywords: [
    "DemumuMind MCP",
    "DemumuMind",
    "DemumuMind MCP directory",
    "Model Context Protocol",
    "Claude MCP",
    "AI agent tools",
    "MCP directory",
  ],
  openGraph: {
    title: "DemumuMind MCP",
    description:
      "Discover, evaluate, and submit MCP servers for AI agents in one curated catalog.",
    url: "/",
    siteName: "DemumuMind MCP",
    images: [
      {
        url: "/demumumind-og.png",
        width: 1200,
        height: 630,
        alt: "DemumuMind MCP",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DemumuMind MCP",
    description:
      "Discover, evaluate, and submit MCP servers for AI agents in one curated catalog.",
    images: ["/demumumind-og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const cookieStore = await cookies();
  const initialConsent = parseCookieConsent(
    cookieStore.get(COOKIE_CONSENT_COOKIE_KEY)?.value,
  );

  return (
    <html lang={locale} className="dark" data-scroll-behavior="smooth">
      <body
        className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-50"
      >
        <LocaleProvider locale={locale}>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_40%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.16),transparent_35%),linear-gradient(180deg,#020617_0%,#020617_45%,#0b1020_100%)]" />
            <SiteHeader locale={locale} />
            <main className="flex-1">{children}</main>
            <SiteFooter locale={locale} />
            <CookieConsentBanner initialConsent={initialConsent} />
            <Toaster richColors position="top-right" />
            <ConsentAnalytics initialConsent={initialConsent} />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
