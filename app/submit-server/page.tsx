import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, ShieldCheck, Sparkles, Workflow } from "lucide-react";
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
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02050f_0%,#050a18_45%,#090816_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_16%_8%,rgba(217,70,239,0.2),transparent_42%),radial-gradient(circle_at_84%_10%,rgba(59,130,246,0.18),transparent_40%)]" />

      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-3xl border border-fuchsia-400/20 bg-indigo-950/72 p-6 sm:p-10">
          <Badge className="mb-4 border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-200">
            <Sparkles className="size-3" />
            {tr(locale, "Server Submission", "Server Submission")}
          </Badge>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-violet-50 sm:text-6xl">
            {tr(locale, "Submit your MCP server", "Submit your MCP server")}
          </h1>
          <p className="mt-5 max-w-4xl text-sm leading-8 text-violet-200 sm:text-lg">
            {tr(
              locale,
              "Use the guided flow to prepare a high-signal submission for moderation. Submission access is limited to authenticated users.",
              "Use the guided flow to prepare a high-signal submission for moderation. Submission access is limited to authenticated users.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="/catalog">
                {tr(locale, "Open catalog", "Open catalog")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-indigo-900/70 text-violet-50 hover:bg-indigo-900">
              <Link href="/account">{tr(locale, "View my account", "View my account")}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-white/10 bg-indigo-950/76">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-violet-50">
                  <item.icon className="size-4 text-fuchsia-200" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-violet-200">{item.description}</CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-indigo-950/72 p-4 sm:p-6">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-violet-50">{tr(locale, "Submission flow", "Submission flow")}</h2>
          <p className="mb-5 text-sm leading-7 text-violet-200">
            {tr(
              locale,
              "Complete all steps, review your metadata, and submit to moderation. Approved entries become discoverable in the public catalog.",
              "Complete all steps, review your metadata, and submit to moderation. Approved entries become discoverable in the public catalog.",
            )}
          </p>
          <SubmitServerWizard />
        </div>
      </section>
    </div>
  );
}
