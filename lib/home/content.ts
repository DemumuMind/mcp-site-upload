import { Activity, Blocks, CheckCircle2, Command, Search, ShieldCheck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { tr, type Locale } from "@/lib/i18n";

export type HomeWorkflowCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  accentClass: string;
};

export type HomeIcpCard = {
  title: string;
  description: string;
  outcome: string;
  icon: LucideIcon;
};

export type HomeTrustPoint = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    pulseLabel: string;
    pulseText: string;
  };
  metrics: {
    heading: string;
    description: string;
    labels: {
      servers: string;
      tools: string;
      categories: string;
    };
  };
  workflows: {
    heading: string;
    description: string;
    cards: HomeWorkflowCard[];
  };
  trust: {
    heading: string;
    description: string;
    points: HomeTrustPoint[];
    categoriesLabel: string;
    languagesLabel: string;
    featuredLabel: string;
    featuredEmptyLabel: string;
    featuredToolsLabel: string;
    featuredAuthLabel: string;
    exploreCta: string;
  };
  icp: {
    heading: string;
    description: string;
    cards: HomeIcpCard[];
  };
  finalCta: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

export function getHomeContent(locale: Locale): HomeContent {
  return {
    hero: {
      eyebrow: tr(locale, "Community-Curated MCP Directory", "Community-Curated MCP Directory"),
      titleLead: tr(locale, "Ship MCP Integrations with", "Ship MCP Integrations with"),
      titleAccent: tr(locale, "Discovery + Trust", "Discovery + Trust"),
      description: tr(
        locale,
        "Find production-ready MCP servers, review auth and verification signals, and move from evaluation to rollout faster.",
        "Find production-ready MCP servers, review auth and verification signals, and move from evaluation to rollout faster.",
      ),
      primaryCta: tr(locale, "Open Catalog", "Open Catalog"),
      secondaryCta: tr(locale, "Submit Server", "Submit Server"),
      pulseLabel: tr(locale, "Live catalog signal", "Live catalog signal"),
      pulseText: tr(locale, "Fresh metadata, moderation context, and trust-first discovery in one workspace.", "Fresh metadata, moderation context, and trust-first discovery in one workspace."),
    },
    metrics: {
      heading: tr(locale, "MCP catalog at a glance", "MCP catalog at a glance"),
      description: tr(
        locale,
        "Track active supply, tooling depth, and category coverage before committing an integration path.",
        "Track active supply, tooling depth, and category coverage before committing an integration path.",
      ),
      labels: {
        servers: tr(locale, "Active servers", "Active servers"),
        tools: tr(locale, "Published tools", "Published tools"),
        categories: tr(locale, "Categories", "Categories"),
      },
    },
    workflows: {
      heading: tr(locale, "The MCP delivery workflow", "The MCP delivery workflow"),
      description: tr(
        locale,
        "A compact operating model for discovery, review, and production rollout.",
        "A compact operating model for discovery, review, and production rollout.",
      ),
      cards: [
        {
          title: tr(locale, "Catalog Discovery Engine", "Catalog Discovery Engine"),
          description: tr(
            locale,
            "Search servers by category, auth model, and verification context in one flow.",
            "Search servers by category, auth model, and verification context in one flow.",
          ),
          href: "/catalog",
          cta: tr(locale, "Explore catalog", "Explore catalog"),
          icon: Search,
          accentClass: "text-cyan-300",
        },
        {
          title: tr(locale, "Submission Pipeline", "Submission Pipeline"),
          description: tr(
            locale,
            "Collect new server submissions while keeping quality through moderation gates.",
            "Collect new server submissions while keeping quality through moderation gates.",
          ),
          href: "/submit-server",
          cta: tr(locale, "Submit a server", "Submit a server"),
          icon: ShieldCheck,
          accentClass: "text-violet-300",
        },
        {
          title: tr(locale, "Health Signal Monitoring", "Health Signal Monitoring"),
          description: tr(
            locale,
            "Use status signals to prioritize reliable integrations for your team.",
            "Use status signals to prioritize reliable integrations for your team.",
          ),
          href: "/about",
          cta: tr(locale, "How it works", "How it works"),
          icon: Activity,
          accentClass: "text-emerald-300",
        },
        {
          title: tr(locale, "Builder Utilities", "Builder Utilities"),
          description: tr(
            locale,
            "Use token estimation and workflow helpers to reduce setup friction.",
            "Use token estimation and workflow helpers to reduce setup friction.",
          ),
          href: "/tools",
          cta: tr(locale, "Open tools", "Open tools"),
          icon: Wrench,
          accentClass: "text-amber-300",
        },
      ],
    },
    trust: {
      heading: tr(locale, "Trust signals before integration", "Trust signals before integration"),
      description: tr(
        locale,
        "Compare featured servers and adoption context without leaving your workflow.",
        "Compare featured servers and adoption context without leaving your workflow.",
      ),
      points: [
        {
          title: tr(locale, "Auth clarity", "Auth clarity"),
          description: tr(locale, "Understand OAuth/API key/open requirements before setup.", "Understand OAuth/API key/open requirements before setup."),
          icon: ShieldCheck,
        },
        {
          title: tr(locale, "Moderated quality", "Moderated quality"),
          description: tr(locale, "Public submissions pass moderation before catalog exposure.", "Public submissions pass moderation before catalog exposure."),
          icon: CheckCircle2,
        },
        {
          title: tr(locale, "Operational fit", "Operational fit"),
          description: tr(locale, "Assess server category and tool depth against your team use case.", "Assess server category and tool depth against your team use case."),
          icon: Blocks,
        },
      ],
      categoriesLabel: tr(locale, "Top categories", "Top categories"),
      languagesLabel: tr(locale, "Top languages", "Top languages"),
      featuredLabel: tr(locale, "Featured servers", "Featured servers"),
      featuredEmptyLabel: tr(locale, "No featured servers yet. Open catalog to explore all available options.", "No featured servers yet. Open catalog to explore all available options."),
      featuredToolsLabel: tr(locale, "tools", "tools"),
      featuredAuthLabel: tr(locale, "Auth", "Auth"),
      exploreCta: tr(locale, "View full catalog", "View full catalog"),
    },
    icp: {
      heading: tr(locale, "Built for real ICPs", "Built for real ICPs"),
      description: tr(
        locale,
        "From indie builders to security teams, everyone gets the same trusted source of truth.",
        "From indie builders to security teams, everyone gets the same trusted source of truth.",
      ),
      cards: [
        {
          title: tr(locale, "Indie Builders", "Indie Builders"),
          description: tr(locale, "Validate options quickly and avoid dead-end integrations.", "Validate options quickly and avoid dead-end integrations."),
          outcome: tr(locale, "Ship your first working integration in days.", "Ship your first working integration in days."),
          icon: Command,
        },
        {
          title: tr(locale, "Product Teams", "Product Teams"),
          description: tr(locale, "Standardize discovery and setup notes across squads.", "Standardize discovery and setup notes across squads."),
          outcome: tr(locale, "Reduce integration rework and accelerate releases.", "Reduce integration rework and accelerate releases."),
          icon: Blocks,
        },
        {
          title: tr(locale, "Platform & Security", "Platform & Security"),
          description: tr(locale, "Review auth and verification context before adoption.", "Review auth and verification context before adoption."),
          outcome: tr(locale, "Improve governance without slowing delivery.", "Improve governance without slowing delivery."),
          icon: ShieldCheck,
        },
      ],
    },
    finalCta: {
      badge: tr(locale, "Priority moderation available", "Priority moderation available"),
      titleLead: tr(locale, "Stop Guessing.", "Stop Guessing."),
      titleAccent: tr(locale, "Start Shipping.", "Start Shipping."),
      description: tr(
        locale,
        "Use one trusted catalog to discover MCP servers and move from selection to rollout with confidence.",
        "Use one trusted catalog to discover MCP servers and move from selection to rollout with confidence.",
      ),
      primaryCta: tr(locale, "Open Catalog", "Open Catalog"),
      secondaryCta: tr(locale, "Read setup guide", "Read setup guide"),
    },
  };
}
