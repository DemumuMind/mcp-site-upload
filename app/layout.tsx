import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConsentAnalytics } from "@/components/consent-analytics";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
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
export default async function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getServerLocale();
    return (<html lang={locale} className="dark" data-theme="cosmic-burst" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LocaleProvider locale={locale}>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-30 bg-cosmic-burst"/>
            <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_48%_48%,rgba(255,210,255,0.22),transparent_25%),radial-gradient(circle_at_46%_52%,rgba(80,95,255,0.45),transparent_54%),radial-gradient(circle_at_18%_14%,rgba(58,116,255,0.22),transparent_40%)] animate-cosmic-pulse"/>
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-conic-gradient(from_220deg_at_48%_48%,rgba(255,255,255,0.16)_0deg,rgba(255,255,255,0)_4deg,rgba(255,255,255,0)_18deg)] opacity-[0.14]"/>

            <SiteHeader locale={locale}/>
            <main className="relative z-10 flex-1">{children}</main>
            <SiteFooter locale={locale}/>
            <CookieConsentBanner />
            <Toaster richColors position="top-right"/>
            <ConsentAnalytics />
            <SpeedInsights />
          </div>
        </LocaleProvider>
      </body>
    </html>);
}
