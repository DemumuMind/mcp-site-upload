import type { Metadata } from "next";
import Link from "next/link";

import { PageFrame, PageHero, PageSection } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import {
  getLegalLastUpdatedValue,
  legalEmail,
  legalGmailComposeUrl,
  privacySections,
} from "@/lib/legal-content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Privacy Policy", "Политика конфиденциальности"),
    description: tr(
      locale,
      "Privacy policy for DemumuMind MCP.",
      "Политика конфиденциальности DemumuMind MCP.",
    ),
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="content">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="violet"
          eyebrow={tr(locale, "Legal", "Юридическая информация")}
          title={tr(locale, "Privacy Policy", "Политика конфиденциальности")}
          description={tr(
            locale,
            "How DemumuMind collects, uses, and protects data across account, catalog, and submission workflows.",
            "Как DemumuMind собирает, использует и защищает данные в аккаунте, каталоге и workflow отправки.",
          )}
          actions={
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
              >
                <Link href="/terms">{tr(locale, "Open Terms", "Открыть условия")}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
              >
                <Link href="/contact">{tr(locale, "Contact legal", "Связаться с legal")}</Link>
              </Button>
            </div>
          }
          metrics={
            <div className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3">
              <p className="text-[11px] tracking-[0.14em] text-slate-400 uppercase">
                {tr(locale, "Last updated", "Последнее обновление")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {getLegalLastUpdatedValue(locale)}
              </p>
            </div>
          }
        />

        <PageSection className="space-y-6">
          {privacySections.map((section) => (
            <section key={section.id} className="space-y-3 border-t border-white/10 pt-5 first:border-none first:pt-0">
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
              {tr(locale, "9. Contact", "9. Контакты")}
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
        </PageSection>
      </div>
    </PageFrame>
  );
}
