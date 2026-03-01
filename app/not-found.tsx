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
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-card to-background" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(color-mix(in_oklab,var(--border)_35%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--border)_35%,transparent)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <section className="w-full max-w-4xl rounded-[30px] border border-border bg-card p-6 text-center shadow-xl sm:p-10">
        <div className="mb-4 flex justify-center">
          <BrandLockup subtitle="MCP Directory" />
        </div>

        <p className="text-[clamp(5rem,14vw,8.6rem)] leading-none font-semibold tracking-[0.14em] text-transparent  bg-gradient-to-r from-primary via-accent to-primary bg-clip-text">
          404
        </p>
        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />

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
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
              className="group rounded-2xl border border-border bg-card px-4 py-5 text-left transition hover:border-border hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <item.icon className="size-5 text-primary transition group-hover:text-primary" />
              <p className="mt-3 text-base font-semibold text-foreground">{tr(locale, item.title, item.title)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tr(locale, item.description, item.description)}</p>
            </Link>
          ))}
        </div>

        <p className="mt-8 border-t border-border pt-5 text-sm text-muted-foreground">
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


