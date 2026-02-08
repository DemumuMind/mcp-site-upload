import Link from "next/link";

import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
      <p className="text-sm text-slate-400">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
        {tr(locale, "Page not found", "Страница не найдена")}
      </h1>
      <p className="max-w-md text-sm text-slate-300">
        {tr(
          locale,
          "The page you requested does not exist or has moved.",
          "Запрошенная страница не существует или была перемещена.",
        )}
      </p>
      <Link
        href="/"
        className="rounded-md border border-white/15 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/[0.06]"
      >
        {tr(locale, "Back to home", "На главную")}
      </Link>
    </div>
  );
}


