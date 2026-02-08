import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the BridgeMind team.",
};

const contactChannels = [
  {
    title: "General Questions",
    description: "Platform usage, account support, roadmap requests, and collaboration questions.",
    response: "Response target: within 1 business day.",
    href: "mailto:hello@bridgemind.ai?subject=BridgeMind%20General%20Request",
    cta: "Email team",
    icon: Mail,
    accentClass: "text-cyan-200",
  },
  {
    title: "Partnerships",
    description: "Co-marketing, enterprise onboarding, and ecosystem partnership requests.",
    response: "Response target: within 2 business days.",
    href: "mailto:partners@bridgemind.ai?subject=BridgeMind%20Partnership",
    cta: "Contact partnerships",
    icon: BriefcaseBusiness,
    accentClass: "text-emerald-200",
  },
  {
    title: "Community",
    description: "Join builder conversations, events, benchmark discussions, and release notes.",
    response: "Discord channels are monitored daily.",
    href: "/discord",
    cta: "Open Discord",
    icon: MessageSquareText,
    accentClass: "text-violet-200",
  },
] as const;

const messageChecklist = [
  "Your team or project name",
  "What you are trying to ship with MCP",
  "Current blockers or integration constraints",
  "Links/screenshots that provide context",
] as const;

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#031022_0%,#050d1d_45%,#030915_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(circle_at_20%_5%,rgba(56,189,248,0.22),transparent_40%),radial-gradient(circle_at_80%_5%,rgba(16,185,129,0.14),transparent_38%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14">
        <section className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-6 sm:p-8">
          <Badge className="mb-4 w-fit border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
            Company
          </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-100 sm:text-6xl">
            Contact BridgeMind
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Reach the team for support, partnerships, and collaboration around MCP rollouts.
            Send context up front and we can route your request faster.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="mailto:hello@bridgemind.ai?subject=BridgeMind%20Contact%20Request">
                hello@bridgemind.ai
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-slate-900/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/discord">Open Discord</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Contact channels">
          {contactChannels.map((channel) => (
            <Card key={channel.title} className="border-white/10 bg-slate-950/75">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
                  <channel.icon className={`size-4 ${channel.accentClass}`} />
                  {channel.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p>{channel.description}</p>
                <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {channel.response}
                </div>
                <div>
                  <Button asChild variant="ghost" className="h-auto px-0 text-slate-100 hover:bg-transparent">
                    <Link href={channel.href}>
                      {channel.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-white/10 bg-slate-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <ShieldCheck className="size-5 text-cyan-200" />
                Send a high-signal request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Include these details in your first message to reduce back-and-forth:</p>
              <ul className="space-y-2">
                {messageChecklist.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-white/10 bg-slate-900/65 px-3 py-2 text-slate-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <Clock3 className="size-5 text-emerald-200" />
                Response windows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Mon-Fri: 09:00-18:00 UTC</p>
              <p>Priority issues: include urgent in subject line.</p>
              <p>Community channels: daily async moderation.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
