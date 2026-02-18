import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { SubmitServerWizard } from "@/components/submit-server-wizard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const highlights = [
  {
    icon: Workflow,
    title: "3-step workflow",
    description: "Basics → Technical details → Review and submit.",
  },
  {
    icon: ShieldCheck,
    title: "Authenticated submission flow",
    description: "Sign in first, then complete the guided flow and submit with your account context.",
  },
  {
    icon: ClipboardCheck,
    title: "Moderation-ready payload",
    description: "Structured metadata helps reviewers validate your server faster.",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "Submit Server", "Submit Server"),
    description: tr(
      locale,
      "Submit an MCP server through a guided 3-step workflow with draft recovery and moderation-ready metadata.",
      "Submit an MCP server through a guided 3-step workflow with draft recovery and moderation-ready metadata.",
    ),
  };
}

export default async function SubmitServerPage() {
  const locale = await getLocale();

  return (
    <PageFrame>
      <PageShell>
        <PageHero
          surface="mesh"
          eyebrow={
            <Badge className="border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-200">
              <Sparkles className="size-3" />
              {tr(locale, "Server Submission", "Server Submission")}
            </Badge>
          }
          title={tr(locale, "Submit your MCP server", "Submit your MCP server")}
          description={tr(
            locale,
            "Use the guided flow to prepare a high-signal submission for moderation. Submission access is limited to authenticated users.",
            "Use the guided flow to prepare a high-signal submission for moderation. Submission access is limited to authenticated users.",
          )}
          actions={
            <>
              <Button asChild className="bg-blue-500 hover:bg-blue-400">
                <Link href="/catalog">
                  {tr(locale, "Open catalog", "Open catalog")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-blacksmith bg-card text-foreground hover:bg-accent">
                <Link href="/account">{tr(locale, "View my account", "View my account")}</Link>
              </Button>
            </>
          }
        />

        <PageSection surface="steel" className="grid gap-4 lg:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-blacksmith bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <item.icon className="size-4 text-fuchsia-200" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </PageSection>

        <PageSection surface="rail">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">{tr(locale, "Submission flow", "Submission flow")}</h2>
          <p className="mb-5 text-sm leading-7 text-muted-foreground">
            {tr(
              locale,
              "Complete all steps, review your metadata, and submit to moderation. Approved entries become discoverable in the public catalog.",
              "Complete all steps, review your metadata, and submit to moderation. Approved entries become discoverable in the public catalog.",
            )}
          </p>
          <SubmitServerWizard />
        </PageSection>
      </PageShell>
    </PageFrame>
  );
}
