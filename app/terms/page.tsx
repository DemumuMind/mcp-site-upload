import type { Metadata } from "next";

import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import {
  getLegalLastUpdatedValue,
  legalEmail,
  legalGmailComposeUrl,
  termsSections,
} from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms of Service | DemumuMind MCP",
  description: "Terms of service and acceptable use policy for DemumuMind MCP.",
};

export default async function TermsPage() {
  const locale = await getLocale();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">
          {tr(locale, "Terms of Service", "Пользовательское соглашение")}
        </h1>
        <p className="text-sm text-slate-400">
          {tr(locale, "Last updated:", "Последнее обновление:")} {getLegalLastUpdatedValue(locale)}
        </p>
      </header>

      {termsSections.map((section) => (
        <section key={section.id} className="space-y-3 border-t border-white/10 pt-5">
          <h2 className="text-2xl font-semibold text-slate-100">
            {tr(locale, section.title.en, section.title.ru)}
          </h2>

          {section.paragraph ? (
            <p className="text-base leading-8 text-slate-300">
              {tr(locale, section.paragraph.en, section.paragraph.ru)}
            </p>
          ) : null}

          {section.bullets ? (
            <ul className="space-y-3 pl-5 text-base leading-8 text-slate-300">
              {section.bullets.map((bullet) => (
                <li key={bullet.en} className="list-disc marker:text-sky-400">
                  {tr(locale, bullet.en, bullet.ru)}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section className="space-y-3 border-t border-white/10 pt-5">
        <h2 className="text-2xl font-semibold text-slate-100">
          {tr(locale, "12. Contact", "12. Контакты")}
        </h2>
        <p className="text-base leading-8 text-slate-300">
          {tr(locale, "Email:", "Email:")}{" "}
          <a
            href={legalGmailComposeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 underline underline-offset-2 transition hover:text-sky-200"
          >
            {legalEmail}
          </a>
        </p>
      </section>
    </div>
  );
}
