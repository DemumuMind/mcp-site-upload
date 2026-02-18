import type { Metadata } from "next";
import { PageActionZone, PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getLegalLastUpdatedValue, legalEmail, legalGmailComposeUrl, privacySections } from "@/lib/legal-content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "Privacy Policy", "Privacy Policy"),
    description: tr(locale, "Privacy policy for DemumuMind MCP.", "Privacy policy for DemumuMind MCP."),
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="content">
      <PageShell className="max-w-4xl px-4 sm:px-6">
        <PageHero
          animated={false}
          badgeTone="violet"
          eyebrow={tr(locale, "Legal", "Legal")}
          title={tr(locale, "Privacy Policy", "Privacy Policy")}
          description={`${tr(locale, "Last updated:", "Last updated:")} ${getLegalLastUpdatedValue(locale)}`}
        />

        {privacySections.map((section) => (
          <PageSection key={section.id} className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">{tr(locale, section.title.en, section.title.en)}</h2>

            {section.paragraph ? (
              <p className="text-base leading-8 text-muted-foreground">{tr(locale, section.paragraph.en, section.paragraph.en)}</p>
            ) : null}

            {section.bullets ? (
              <ul className="space-y-3 pl-5 text-base leading-8 text-muted-foreground">
                {section.bullets.map((bullet) => (
                  <li key={bullet.en} className="list-disc marker:text-primary">
                    {tr(locale, bullet.en, bullet.en)}
                  </li>
                ))}
              </ul>
            ) : null}
          </PageSection>
        ))}

        <PageActionZone className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">{tr(locale, "9. Contact", "9. Contact")}</h2>
          <p className="text-base leading-8 text-muted-foreground">
            {tr(locale, "Email:", "Email:")} {" "}
            <a href={legalGmailComposeUrl} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 transition hover:text-primary">
              {legalEmail}
            </a>
          </p>
        </PageActionZone>
      </PageShell>
    </PageFrame>
  );
}
