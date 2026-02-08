import Link from "next/link";
import { type LucideIcon, BookOpen, Grid3X3, House, Send, TriangleAlert } from "lucide-react";

import { BrandLockup } from "@/components/brand-lockup";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type QuickLink = {
  href: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  icon: LucideIcon;
};

const quickLinks: readonly QuickLink[] = [
  {
    href: "/catalog",
    titleEn: "Browse Catalog",
    titleRu: "Каталог серверов",
    descriptionEn: "Discover active MCP servers and categories",
    descriptionRu: "Найдите активные MCP-серверы и категории",
    icon: Grid3X3,
  },
  {
    href: "/how-to-use",
    titleEn: "Setup Guide",
    titleRu: "Гайд по настройке",
    descriptionEn: "Connect MCP clients and verify tool calls",
    descriptionRu: "Подключите MCP-клиенты и проверьте tool-вызовы",
    icon: BookOpen,
  },
  {
    href: "/submit-server",
    titleEn: "Submit Server",
    titleRu: "Отправить сервер",
    descriptionEn: "Publish your MCP server in the directory",
    descriptionRu: "Опубликуйте ваш MCP-сервер в каталоге",
    icon: Send,
  },
];

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <div className="relative isolate flex min-h-[82vh] items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_78%_8%,rgba(14,165,233,0.11),transparent_35%),linear-gradient(180deg,#020711_0%,#040913_50%,#050b16_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <section className="w-full max-w-4xl rounded-[30px] border border-cyan-400/18 bg-slate-950/92 p-6 text-center shadow-[0_0_0_1px_rgba(59,130,246,0.06),0_30px_120px_rgba(2,6,23,0.7)] sm:p-10">
        <div className="mb-4 flex justify-center">
          <BrandLockup subtitle="MCP Directory" />
        </div>
        <p className="text-[clamp(5rem,14vw,8.6rem)] leading-none font-semibold tracking-[0.14em] text-transparent [text-shadow:0_0_40px_rgba(34,211,238,0.2)] bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text">
          404
        </p>
        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

        <h1 className="mt-7 text-3xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
          {tr(locale, "MCP Route Not Found", "Маршрут MCP не найден")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg">
          {tr(
            locale,
            "This page does not exist in the DemumuMind MCP directory, or it has been moved. Use the links below to get back to active routes.",
            "Эта страница отсутствует в каталоге DemumuMind MCP или была перемещена. Используйте ссылки ниже, чтобы вернуться к рабочим разделам.",
          )}
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/catalog"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/25 bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(14,165,233,0.35)] transition hover:from-sky-400 hover:to-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <House className="size-4" />
            {tr(locale, "Open Catalog", "Открыть каталог")}
          </Link>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-cyan-400/15 bg-slate-950/70 px-4 py-5 text-left transition hover:border-cyan-300/35 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <item.icon className="size-5 text-cyan-300 transition group-hover:text-cyan-200" />
              <p className="mt-3 text-base font-semibold text-slate-100">
                {tr(locale, item.titleEn, item.titleRu)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {tr(locale, item.descriptionEn, item.descriptionRu)}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-8 border-t border-white/10 pt-5 text-sm text-slate-400">
          <TriangleAlert className="mr-1 inline size-4 text-cyan-300" />
          {tr(locale, "Still blocked? We can help you route the request.", "Нужна помощь? Мы поможем восстановить маршрут.")}{" "}
          <Link
            href="/contact"
            className="font-semibold text-cyan-300 underline-offset-4 transition hover:text-cyan-200 hover:underline"
          >
            {tr(locale, "Contact Support", "Связаться с поддержкой")}
          </Link>
        </p>
      </section>
    </div>
  );
}
