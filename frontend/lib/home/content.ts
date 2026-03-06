import { tr, type Locale } from "@/lib/i18n";

export type HomeWorkflowCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: string;
  accentClass: string;
};

export type HomeIcpCard = {
  title: string;
  description: string;
  outcome: string;
  icon: string;
};

export type HomeTrustPoint = {
  title: string;
  description: string;
  icon: string;
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
      eyebrow: tr(locale, "Independent MCP catalog", "Independent MCP catalog"),
      titleLead: tr(locale, "DemumuMind", "DemumuMind"),
      titleAccent: tr(locale, "The MCP catalog for teams that ship.", "The MCP catalog for teams that ship."),
      description: tr(
        locale,
        "Review auth model, tool depth, and moderation context before your team spends a week on the wrong integration.",
        "Review auth model, tool depth, and moderation context before your team spends a week on the wrong integration.",
      ),
      primaryCta: tr(locale, "Start Exploring Servers", "Start Exploring Servers"),
      secondaryCta: tr(locale, "Submit Your Server", "Submit Your Server"),
      pulseLabel: tr(locale, "Catalog preview", "Catalog preview"),
      pulseText: tr(
        locale,
        "A readable review surface for discovery, trust checks, and rollout decisions.",
        "A readable review surface for discovery, trust checks, and rollout decisions.",
      ),
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
      heading: tr(locale, "A shorter path from discovery to rollout", "A shorter path from discovery to rollout"),
      description: tr(
        locale,
        "Each step removes a specific source of integration drag instead of adding another dashboard to watch.",
        "Each step removes a specific source of integration drag instead of adding another dashboard to watch.",
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
          icon: "search",
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
          icon: "shield-check",
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
          icon: "activity",
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
          icon: "wrench",
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
      heading: tr(locale, "Signal before setup", "Signal before setup"),
      description: tr(
        locale,
        "Use the catalog as a review surface: validate fit, check trust context, and shortlist faster.",
        "Use the catalog as a review surface: validate fit, check trust context, and shortlist faster.",
      ),
      points: [
        {
          title: tr(locale, "Auth clarity", "Auth clarity"),
          description: tr(locale, "Understand OAuth/API key/open requirements before setup.", "Understand OAuth/API key/open requirements before setup."),
          icon: "shield-check",
        },
        {
          title: tr(locale, "Moderated quality", "Moderated quality"),
          description: tr(locale, "Public submissions pass moderation before catalog exposure.", "Public submissions pass moderation before catalog exposure."),
          icon: "check-circle",
        },
        {
          title: tr(locale, "Operational fit", "Operational fit"),
          description: tr(locale, "Assess server category and tool depth against your team use case.", "Assess server category and tool depth against your team use case."),
          icon: "blocks",
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
      heading: tr(locale, "One source of truth for every delivery lane", "One source of truth for every delivery lane"),
      description: tr(
        locale,
        "The same catalog supports first experiments, production delivery, and security review without branching into separate workflows.",
        "The same catalog supports first experiments, production delivery, and security review without branching into separate workflows.",
      ),
      cards: [
        {
          title: tr(locale, "Indie Builders", "Indie Builders"),
          description: tr(locale, "Validate options quickly and avoid dead-end integrations.", "Validate options quickly and avoid dead-end integrations."),
          outcome: tr(locale, "Ship your first working integration in days.", "Ship your first working integration in days."),
          icon: "command",
        },
        {
          title: tr(locale, "Product Teams", "Product Teams"),
          description: tr(locale, "Standardize discovery and setup notes across squads.", "Standardize discovery and setup notes across squads."),
          outcome: tr(locale, "Reduce integration rework and accelerate releases.", "Reduce integration rework and accelerate releases."),
          icon: "blocks",
        },
        {
          title: tr(locale, "Platform & Security", "Platform & Security"),
          description: tr(locale, "Review auth and verification context before adoption.", "Review auth and verification context before adoption."),
          outcome: tr(locale, "Improve governance without slowing delivery.", "Improve governance without slowing delivery."),
          icon: "shield-check",
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
      badge: tr(locale, "Curated catalog, live trust context", "Curated catalog, live trust context"),
      titleLead: tr(locale, "DemumuMind keeps MCP selection readable.", "DemumuMind keeps MCP selection readable."),
      titleAccent: tr(locale, "Move from shortlist to rollout without guesswork.", "Move from shortlist to rollout without guesswork."),
      description: tr(
        locale,
        "Open the catalog when you need real selection signal, not another vague integration marketplace.",
        "Open the catalog when you need real selection signal, not another vague integration marketplace.",
      ),
      primaryCta: tr(locale, "Open the Catalog", "Open the Catalog"),
      secondaryCta: tr(locale, "Read the Setup Guide", "Read the Setup Guide"),
    },
  };
}
