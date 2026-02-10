import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Pricing", "Цены"),
    description: tr(
      locale,
      "Pricing details for DemumuMind MCP.",
      "Тарифы и текущий план для DemumuMind MCP.",
    ),
  };
}

export default async function PricingPage() {
  const locale = await getLocale();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          {tr(locale, "Pricing", "Цены")}
        </h1>
        <p className="text-sm text-slate-300">
          {tr(
            locale,
            "Catalog browsing and server discovery are currently free.",
            "Просмотр каталога и поиск серверов сейчас бесплатны.",
          )}
        </p>
      </div>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-slate-100">
            {tr(locale, "Current plan: Free", "Текущий план: Free")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
            <p>{tr(locale, "Browse verified and community MCP server listings.", "Просматривайте верифицированные и community MCP-серверы.")}</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
            <p>{tr(locale, "Use category, language, and auth filters in the catalog.", "Используйте фильтры по категориям, языкам и авторизации.")}</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
            <p>{tr(locale, "Submit your MCP server after login for moderation.", "Отправляйте MCP-сервер на модерацию после входа.")}</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
          >
            <Link href="/catalog">{tr(locale, "Go to catalog", "Перейти в каталог")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
