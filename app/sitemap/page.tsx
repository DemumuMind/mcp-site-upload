import type { Metadata } from "next";
import Link from "next/link";

import { PageFrame, PageHero, PageSection } from "@/components/page-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type LocalizedCopy = {
  en: string;
  ru: string;
};

type SectionLink = {
  href: string;
  title: LocalizedCopy;
  description: LocalizedCopy;
};

type SiteMapSection = {
  title: LocalizedCopy;
  links: SectionLink[];
};

const sections: readonly SiteMapSection[] = [
  {
    title: {
      en: "Core Pages",
      ru: "Основные страницы",
    },
    links: [
      {
        href: "/",
        title: {
          en: "Home",
          ru: "Главная",
        },
        description: {
          en: "Discover MCP workflows and start shipping integrations.",
          ru: "Изучайте MCP-workflow и запускайте интеграции быстрее.",
        },
      },
      {
        href: "/about",
        title: {
          en: "About DemumuMind",
          ru: "О DemumuMind",
        },
        description: {
          en: "Mission, vision, and operating model for MCP delivery.",
          ru: "Миссия, видение и операционная модель поставки MCP.",
        },
      },
      {
        href: "/pricing",
        title: {
          en: "Pricing",
          ru: "Цены",
        },
        description: {
          en: "Current plans and platform access details.",
          ru: "Текущие планы и условия доступа к платформе.",
        },
      },
    ],
  },
  {
    title: {
      en: "Resources",
      ru: "Ресурсы",
    },
    links: [
      {
        href: "/blog",
        title: {
          en: "Blog",
          ru: "Блог",
        },
        description: {
          en: "Articles about MCP adoption, operations, and best practices.",
          ru: "Статьи о внедрении MCP, эксплуатации и практиках поставки.",
        },
      },
      {
        href: "/how-to-use",
        title: {
          en: "Setup Guide",
          ru: "Гайд по настройке",
        },
        description: {
          en: "Step-by-step instructions for connection and rollout.",
          ru: "Пошаговые инструкции по подключению и rollout.",
        },
      },
    ],
  },
  {
    title: {
      en: "Community",
      ru: "Сообщество",
    },
    links: [
      {
        href: "/discord",
        title: {
          en: "Discord community",
          ru: "Discord-сообщество",
        },
        description: {
          en: "Join the DemumuMind developer community.",
          ru: "Присоединяйтесь к сообществу разработчиков DemumuMind.",
        },
      },
      {
        href: "/contact",
        title: {
          en: "Contact",
          ru: "Контакты",
        },
        description: {
          en: "Get in touch with the BridgeMind team.",
          ru: "Свяжитесь с командой BridgeMind.",
        },
      },
    ],
  },
  {
    title: {
      en: "Legal",
      ru: "Юридическая информация",
    },
    links: [
      {
        href: "/terms",
        title: {
          en: "Terms of Service",
          ru: "Пользовательское соглашение",
        },
        description: {
          en: "Legal terms and acceptable use policy.",
          ru: "Юридические условия и правила допустимого использования.",
        },
      },
      {
        href: "/privacy",
        title: {
          en: "Privacy Policy",
          ru: "Политика конфиденциальности",
        },
        description: {
          en: "Data privacy and protection information.",
          ru: "Информация о приватности и защите данных.",
        },
      },
    ],
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Sitemap", "Карта сайта"),
    description: tr(
      locale,
      "Full DemumuMind site navigation.",
      "Полная навигация по сайту DemumuMind.",
    ),
  };
}

export default async function SitemapPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="content">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="violet"
          eyebrow={tr(locale, "Navigation", "Навигация")}
          title={tr(locale, "DemumuMind Sitemap", "Карта сайта DemumuMind")}
          description={tr(
            locale,
            "A complete index of core pages, resources, community hubs, and legal documents.",
            "Полный индекс ключевых страниц, ресурсов, community-разделов и юридических документов.",
          )}
          actions={
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sitemap.xml"
                className="inline-flex h-11 items-center rounded-xl border border-white/20 bg-slate-950/70 px-4 text-sm text-slate-100 transition hover:bg-slate-900"
              >
                {tr(locale, "Open sitemap.xml", "Открыть sitemap.xml")}
              </Link>
              <Link
                href="/llms.txt"
                className="inline-flex h-11 items-center rounded-xl border border-white/20 bg-slate-950/70 px-4 text-sm text-slate-100 transition hover:bg-slate-900"
              >
                {tr(locale, "Open llms.txt", "Открыть llms.txt")}
              </Link>
            </div>
          }
        />

        <PageSection>
          <div className="grid gap-5">
            {sections.map((section) => (
              <section key={section.title.en} className="space-y-3">
                <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  {tr(locale, section.title.en, section.title.ru)}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {section.links.map((item) => (
                    <Card key={item.href} className="border-white/10 bg-slate-900/65">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-slate-100">
                          <Link href={item.href} className="transition hover:text-white">
                            {tr(locale, item.title.en, item.title.ru)}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-300">
                        {tr(locale, item.description.en, item.description.ru)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </PageSection>
      </div>
    </PageFrame>
  );
}
