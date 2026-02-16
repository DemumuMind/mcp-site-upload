import Link from "next/link";
import { type LucideIcon, BookOpen, Grid3X3, House, Send, TriangleAlert } from "lucide-react";

import { BrandLockup } from "@/components/brand-lockup";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type QuickLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const quickLinks: readonly QuickLink[] = [
  {
    href: "/catalog",
    title: "Browse Catalog",
    description: "Discover active MCP servers and categories",
    icon: Grid3X3,
  },
  {
    href: "/how-to-use",
    title: "Read the Setup Guide",
    description: "Connect MCP clients and verify tool calls",
    icon: BookOpen,
  },
  {
    href: "/submit-server",
    title: "Submit Your Server",
    description: "Publish your MCP server in the directory",
    icon: Send,
  },
];

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <div className="relative isolate flex min-h-[82vh] items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_78%_8%,rgba(14,165,233,0.11),transparent_35%),linear-gradient(180deg,#020711_0%,#040913_50%,#050b16_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <section className="w-full max-w-4xl rounded-[30px] border border-primary/30 bg-card p-6 text-center shadow-[0_0_0_1px_rgba(59,130,246,0.06),0_30px_120px_rgba(2,6,23,0.7)] sm:p-10">
        <div className="mb-4 flex justify-center">
          <BrandLockup subtitle="MCP Directory" />
        </div>

        <p className="text-[clamp(5rem,14vw,8.6rem)] leading-none font-semibold tracking-[0.14em] text-transparent [text-shadow:0_0_40px_rgba(34,211,238,0.2)] bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text">
          404
        </p>
        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

        <h1 className="mt-7 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {tr(locale, "MCP Route Not Found", "MCP Route Not Found")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg">
          {tr(
            locale,
            "This page does not exist in the DemumuMind MCP directory, or it has been moved. Use the links below to get back to active routes.",
            "This page does not exist in the DemumuMind MCP directory, or it has been moved. Use the links below to get back to active routes.",
          )}
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/catalog"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary to-[#f3b811] px-6 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_rgba(14,165,233,0.35)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <House className="size-4" />
            {tr(locale, "Open the Catalog", "Open the Catalog")}
          </Link>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-primary/25 bg-card px-4 py-5 text-left transition hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <item.icon className="size-5 text-primary transition group-hover:text-primary" />
              <p className="mt-3 text-base font-semibold text-foreground">{tr(locale, item.title, item.title)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tr(locale, item.description, item.description)}</p>
            </Link>
          ))}
        </div>

        <p className="mt-8 border-t border-blacksmith pt-5 text-sm text-muted-foreground">
          <TriangleAlert className="mr-1 inline size-4 text-primary" />
          {tr(locale, "Still blocked? We can help you route the request.", "Still blocked? We can help you route the request.")} 
          <Link
            href="/contact"
            className="font-semibold text-primary underline-offset-4 transition hover:text-primary hover:underline"
          >
            {tr(locale, "Contact Support", "Contact Support")}
          </Link>
        </p>
      </section>
    </div>
  );
}


