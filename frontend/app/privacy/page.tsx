import type { Metadata } from "next";
import { PageFrame } from "@/components/page-templates";
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
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.14),transparent_24%),radial-gradient(circle_at_82%_18%,hsl(var(--primary)/0.12),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_60%)]" />
          <div className="section-shell flex min-h-[60vh] flex-col justify-center py-16 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Legal", "Legal")}</p>
            <h1 className="mt-4 max-w-4xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {tr(locale, "Privacy Policy", "Privacy Policy")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {`${tr(locale, "Last updated:", "Last updated:")} ${getLegalLastUpdatedValue(locale)}`}
            </p>
          </div>
        </section>

        <section>
          <div className="section-shell py-12 sm:py-16">
            <div className="space-y-8">
              {privacySections.map((section) => (
                <section key={section.id} className="border-t border-border/60 pt-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{tr(locale, section.title.en, section.title.en)}</h2>

                  {section.paragraph ? (
                    <p className="mt-4 text-base leading-8 text-muted-foreground">{tr(locale, section.paragraph.en, section.paragraph.en)}</p>
                  ) : null}

                  {section.bullets ? (
                    <ul className="mt-4 space-y-3 pl-5 text-base leading-8 text-muted-foreground">
                      {section.bullets.map((bullet) => (
                        <li key={bullet.en} className="list-disc marker:text-primary">
                          {tr(locale, bullet.en, bullet.en)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              <section className="border-t border-border/60 pt-8">
                <h2 className="text-2xl font-semibold text-foreground">{tr(locale, "9. Contact", "9. Contact")}</h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  {tr(locale, "Email:", "Email:")} {" "}
                  <a href={legalGmailComposeUrl} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 transition hover:text-foreground">
                    {legalEmail}
                  </a>
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
