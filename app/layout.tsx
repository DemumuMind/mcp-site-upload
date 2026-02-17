import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ConsentAnalytics } from "@/components/consent-analytics";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { AuthHashRedirector } from "@/components/auth-hash-redirector";
import { AnimeRuntimeEffects } from "@/components/anime-runtime-effects";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SpeedInsightsClient } from "@/components/speed-insights-client";
import { Toaster } from "@/components/ui/sonner";
import {
  COOKIE_CONSENT_COOKIE_KEY,
  COOKIE_CONSENT_PROFILE_COOKIE_KEY,
  cookieConsentChoiceToProfile,
  parseCookieConsent,
  parseCookieConsentProfile,
} from "@/lib/cookie-consent";
import { isRedesignV2Enabled } from "@/lib/design-flags";
import { getLocale as getServerLocale } from "@/lib/i18n-server";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const isVercelDeployment = process.env.VERCEL === "1" || process.env.VERCEL === "true";

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
  description: "A community-curated directory of MCP servers for Claude, OpenAI, and AI agents.",
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
    description: "Discover, evaluate, and submit MCP servers for AI agents in one curated catalog.",
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
    description: "Discover, evaluate, and submit MCP servers for AI agents in one curated catalog.",
    images: ["/demumumind-og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const redesignV2Enabled = isRedesignV2Enabled();
  const locale = await getServerLocale();
  const cookieStore = await cookies();

  const initialConsent = parseCookieConsent(cookieStore.get(COOKIE_CONSENT_COOKIE_KEY)?.value ?? null);
  const initialProfile =
    parseCookieConsentProfile(cookieStore.get(COOKIE_CONSENT_PROFILE_COOKIE_KEY)?.value ?? null) ??
    (initialConsent ? cookieConsentChoiceToProfile(initialConsent) : null);

  const initialAnalyticsAllowed = initialProfile?.analytics ?? false;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark"
      data-theme={redesignV2Enabled ? "blacksmith-v2" : "cosmic-burst"}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LocaleProvider locale={locale}>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-30 bg-blacksmith-foundation" />
            <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(247,201,72,0.18),transparent_42%)] animate-blacksmith-pulse" />
            <div className="pointer-events-none absolute inset-0 -z-10 hero-grid opacity-50" />

            <SiteHeader locale={locale} />
            <AuthHashRedirector />
            <main data-route-container="true" className="page-enter relative z-10 flex-1">{children}</main>
            <AnimeRuntimeEffects />
            <SiteFooter locale={locale} />
            <CookieConsentBanner initialConsent={initialConsent} initialProfile={initialProfile} />
            <Toaster richColors position="top-right" />
            {isVercelDeployment ? <ConsentAnalytics initialAnalyticsAllowed={initialAnalyticsAllowed} /> : null}
            {isVercelDeployment ? <SpeedInsightsClient /> : null}
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}

