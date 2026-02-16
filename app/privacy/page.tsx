import type { Metadata } from "next";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getLegalLastUpdatedValue, legalEmail, legalGmailComposeUrl, privacySections, } from "@/lib/legal-content";
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "Privacy Policy", "Privacy Policy"),
        description: tr(locale, "Privacy policy for DemumuMind MCP.", "Privacy policy for DemumuMind MCP."),
    };
}
export default async function PrivacyPage() {
    const locale = await getLocale();
    return (<div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">
          {tr(locale, "Privacy Policy", "Privacy Policy")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tr(locale, "Last updated:", "Last updated:")} {getLegalLastUpdatedValue(locale)}
        </p>
      </header>

      {privacySections.map((section) => (<section key={section.id} className="space-y-3 border-t border-blacksmith pt-5">
          <h2 className="text-2xl font-semibold text-foreground">
            {tr(locale, section.title.en, section.title.en)}
          </h2>

          {section.paragraph ? (<p className="text-base leading-8 text-muted-foreground">
              {tr(locale, section.paragraph.en, section.paragraph.en)}
            </p>) : null}

          {section.bullets ? (<ul className="space-y-3 pl-5 text-base leading-8 text-muted-foreground">
              {section.bullets.map((bullet) => (<li key={bullet.en} className="list-disc marker:text-sky-400">
                  {tr(locale, bullet.en, bullet.en)}
                </li>))}
            </ul>) : null}
        </section>))}

      <section className="space-y-3 border-t border-blacksmith pt-5">
        <h2 className="text-2xl font-semibold text-foreground">
          {tr(locale, "9. Contact", "9. Contact")}
        </h2>
        <p className="text-base leading-8 text-muted-foreground">
          {tr(locale, "Email:", "Email:")}{" "}
          <a href={legalGmailComposeUrl} target="_blank" rel="noreferrer" className="text-sky-300 underline underline-offset-2 transition hover:text-sky-200">
            {legalEmail}
          </a>
        </p>
      </section>
    </div>);
}

