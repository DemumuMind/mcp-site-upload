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
  logoCloud: {
    label: string;
    brands: string[];
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
  comparison: {
    heading: string;
    description: string;
    selectorLabel: string;
    stacks: Array<{
      id: string;
      label: string;
      legacyTime: string;
      legacyCost: string;
      demumuTime: string;
      demumuCost: string;
      summary: string;
    }>;
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
  showcases: {
    heading: string;
    description: string;
    cards: Array<{
      title: string;
      value: string;
      detail: string;
    }>;
  };
  productProof: {
    heading: string;
    description: string;
    bullets: string[];
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
      titleLead: tr(locale, "DemumuMind helps teams", "DemumuMind helps teams"),
      titleAccent: tr(locale, "Ship MCP Faster", "Ship MCP Faster"),
      description: tr(
        locale,
        "Discover production-ready MCP servers, verify trust signals, and move from first lookup to rollout in one focused workflow.",
        "Discover production-ready MCP servers, verify trust signals, and move from first lookup to rollout in one focused workflow.",
      ),
      primaryCta: tr(locale, "Start Exploring Servers", "Start Exploring Servers"),
      secondaryCta: tr(locale, "Submit Your Server", "Submit Your Server"),
      pulseLabel: tr(locale, "Live catalog signal", "Live catalog signal"),
      pulseText: tr(locale, "Fresh metadata, moderation context, and trust-first discovery in one workspace.", "Fresh metadata, moderation context, and trust-first discovery in one workspace."),
    },
    logoCloud: {
      label: tr(locale, "Trusted by builders and platform teams", "Trusted by builders and platform teams"),
      brands: ["Acme Labs", "StackForge", "OrbitOps", "KernelWorks", "SignalAI", "Northstar Data"],
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
    comparison: {
      heading: tr(locale, "Compare rollout speed by stack", "Compare rollout speed by stack"),
      description: tr(locale, "Switch context by stack and see the expected delta in onboarding effort.", "Switch context by stack and see the expected delta in onboarding effort."),
      selectorLabel: tr(locale, "Team stack", "Team stack"),
      stacks: [
        {
          id: "web",
          label: "Web Product",
          legacyTime: "10-14 days",
          legacyCost: "40+ eng hours",
          demumuTime: "2-4 days",
          demumuCost: "12-16 eng hours",
          summary: tr(locale, "DemumuMind centralizes trust + setup context so product teams skip repeated discovery loops.", "DemumuMind centralizes trust + setup context so product teams skip repeated discovery loops."),
        },
        {
          id: "agent",
          label: "AI Agent Team",
          legacyTime: "7-10 days",
          legacyCost: "28+ eng hours",
          demumuTime: "1-3 days",
          demumuCost: "8-12 eng hours",
          summary: tr(locale, "Authentication and tool coverage are visible before implementation starts.", "Authentication and tool coverage are visible before implementation starts."),
        },
        {
          id: "platform",
          label: "Platform & Security",
          legacyTime: "12-18 days",
          legacyCost: "50+ eng hours",
          demumuTime: "3-5 days",
          demumuCost: "16-22 eng hours",
          summary: tr(locale, "Verification metadata streamlines risk review, approvals, and governance handoff.", "Verification metadata streamlines risk review, approvals, and governance handoff."),
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
      exploreCta: tr(locale, "Open the Catalog", "Open the Catalog"),
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
    showcases: {
      heading: tr(locale, "Teams shipping with the catalog", "Teams shipping with the catalog"),
      description: tr(locale, "Short, outcome-focused stories from users who moved faster after standardizing discovery.", "Short, outcome-focused stories from users who moved faster after standardizing discovery."),
      cards: [
        {
          title: tr(locale, "MCP integration lead time", "MCP integration lead time"),
          value: "-64%",
          detail: tr(locale, "Average reduction after moving selection and validation into one flow.", "Average reduction after moving selection and validation into one flow."),
        },
        {
          title: tr(locale, "Review cycles per integration", "Review cycles per integration"),
          value: "-42%",
          detail: tr(locale, "Teams resolve auth and capability questions before implementation.", "Teams resolve auth and capability questions before implementation."),
        },
        {
          title: tr(locale, "Failed trial integrations", "Failed trial integrations"),
          value: "-55%",
          detail: tr(locale, "Clear compatibility signals help teams avoid dead-end server choices.", "Clear compatibility signals help teams avoid dead-end server choices."),
        },
      ],
    },
    productProof: {
      heading: tr(locale, "Product view with context, not just screenshots", "Product view with context, not just screenshots"),
      description: tr(locale, "Every card combines setup detail, trust signal, and fit summary so teams can decide in one pass.", "Every card combines setup detail, trust signal, and fit summary so teams can decide in one pass."),
      bullets: [
        tr(locale, "Auth method, verification status, and tool count are visible immediately.", "Auth method, verification status, and tool count are visible immediately."),
        tr(locale, "Category and language facets surface operational fit for each team.", "Category and language facets surface operational fit for each team."),
        tr(locale, "One-click paths to setup docs and submission flow keep momentum high.", "One-click paths to setup docs and submission flow keep momentum high."),
      ],
    },
    finalCta: {
      badge: tr(locale, "Priority moderation available", "Priority moderation available"),
      titleLead: tr(locale, "Stop Guessing Server Fit.", "Stop Guessing Server Fit."),
      titleAccent: tr(locale, "Ship with DemumuMind.", "Ship with DemumuMind."),
      description: tr(
        locale,
        "Use one trusted MCP catalog to evaluate, shortlist, and launch integrations with confidence.",
        "Use one trusted MCP catalog to evaluate, shortlist, and launch integrations with confidence.",
      ),
      primaryCta: tr(locale, "Open the Catalog", "Open the Catalog"),
      secondaryCta: tr(locale, "Read the Setup Guide", "Read the Setup Guide"),
    },
  };
}
