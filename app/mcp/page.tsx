import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "MCP Overview",
  description: "Overview of DemumuMind MCP and how it helps teams.",
};

export default async function MCPPage() {
  const locale = await getLocale();

  const highlights = [
    {
      title: tr(locale, "Unified Catalog", "Единый каталог"),
      description: tr(
        locale,
        "Discover MCP servers in one curated searchable directory.",
        "Находите MCP-серверы в одном кураторском каталоге с поиском.",
      ),
      icon: Sparkles,
    },
    {
      title: tr(locale, "Trust Signals", "Сигналы доверия"),
      description: tr(
        locale,
        "Track verification and auth type before connecting a server.",
        "Проверяйте верификацию и тип авторизации до подключения сервера.",
      ),
      icon: ShieldCheck,
    },
    {
      title: tr(locale, "Fast Integration", "Быстрая интеграция"),
      description: tr(
        locale,
        "Copy-ready server config and clear maintainer metadata.",
        "Готовые к копированию конфиги и понятные метаданные мейнтейнера.",
      ),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/55 p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">MCP</h1>
        <p className="max-w-3xl text-sm text-slate-300">
          {tr(
            locale,
            "Discover verified and community MCP servers, inspect tool capabilities, and connect them to your AI workflows.",
            "Находите верифицированные и community MCP-серверы, проверяйте возможности инструментов и подключайте их к AI-workflow.",
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="bg-blue-500 hover:bg-blue-400">
            <Link href="/catalog">
              {tr(locale, "Browse catalog", "Открыть каталог")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
          >
            <Link href="/how-to-use">{tr(locale, "Open setup guide", "Открыть гайд")}</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="MCP highlights">
        {highlights.map((item) => (
          <Card
            key={item.title}
            className="border-white/10 bg-slate-900/70 shadow-[0_0_0_1px_rgba(148,163,184,0.07)] backdrop-blur"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                <item.icon className="size-4 text-blue-400" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">{item.description}</CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
