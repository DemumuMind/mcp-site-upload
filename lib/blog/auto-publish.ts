import { createBlogPostFromResearch } from "@/lib/blog/automation";
import { runDeepResearchWorkflow } from "@/lib/blog/research";
import { normalizeBlogSlug } from "@/lib/blog/slug";

type AutoPublishTopic = {
  topic: string;
  angle?: string;
  titleEn: string;
  tags: string[];
  locale?: "en";
};

const autoPublishTopics: readonly AutoPublishTopic[] = [
  {
    topic: "MCP production incident triage",
    angle: "How teams reduce MTTR with deterministic runbooks and agent guardrails",
    titleEn: "MCP Incident Triage Playbook for Production Teams",
    tags: ["operations", "playbook", "quality"],
  },
  {
    topic: "Agentic coding verification loops",
    angle: "Plan-Check-Plan-Final Check and release confidence",
    titleEn: "Verification Loops for Agentic Engineering Delivery",
    tags: ["workflow", "quality", "playbook"],
  },
  {
    topic: "MCP authentication hardening",
    angle: "Token rotation, auth boundaries, and least-privilege rollout",
    titleEn: "Hardening MCP Authentication in Real Deployments",
    tags: ["operations", "architecture", "quality"],
  },
  {
    topic: "MCP observability stack",
    angle: "Metrics, traces, logs, and release gates for agent workflows",
    titleEn: "Observability Patterns for MCP Workflows",
    tags: ["operations", "architecture", "workflow"],
  },
  {
    topic: "MCP server selection framework",
    angle: "How teams compare reliability, integration cost, and blast radius",
    titleEn: "How to Select MCP Servers with Production Constraints",
    tags: ["architecture", "playbook", "workflow"],
  },
  {
    topic: "Prompt operations for engineering teams",
    angle: "Versioning prompts, regression checks, and rollout safety",
    titleEn: "PromptOps for Engineering Teams: From Draft to Controlled Rollout",
    tags: ["workflow", "operations", "quality"],
  },
  {
    topic: "MCP integration anti-patterns",
    angle: "Common failure modes and how to avoid integration dead ends",
    titleEn: "MCP Integration Anti-Patterns and Recovery Strategies",
    tags: ["architecture", "operations", "quality"],
  },
  {
    topic: "Agent reliability benchmarks",
    angle: "Metrics that matter for enterprise-ready coding agents",
    titleEn: "Reliability Benchmarks for Enterprise Coding Agents",
    tags: ["quality", "operations", "workflow"],
  },
  {
    topic: "MCP change management",
    angle: "Safe migration strategy when replacing integration surfaces",
    titleEn: "MCP Change Management: Safe Migrations and Rollbacks",
    tags: ["playbook", "operations", "architecture"],
  },
  {
    topic: "Security review for MCP workflows",
    angle: "Threat modeling and practical controls for high-risk automations",
    titleEn: "Security Review Checklist for MCP Workflow Automation",
    tags: ["quality", "operations", "playbook"],
  },
  {
    topic: "Cost governance in agentic development",
    angle: "How teams manage model spend without reducing delivery speed",
    titleEn: "Cost Governance in Agentic Engineering Workflows",
    tags: ["operations", "workflow", "quality"],
  },
  {
    topic: "MCP platform architecture scaling",
    angle: "Boundaries, shared modules, and reliability patterns at scale",
    titleEn: "Scaling MCP Platform Architecture Without Losing Control",
    tags: ["architecture", "operations", "workflow"],
  },
];

export type AutoPublishCreatedPost = {
  slug: string;
  topic: string;
  packetId: string;
  sourceCount: number;
  postPath: string;
};

export type AutoPublishFailedPost = {
  topic: string;
  reason: string;
};

export type AutoPublishBatchResult = {
  executedAt: string;
  requestedCount: number;
  createdCount: number;
  failedCount: number;
  created: AutoPublishCreatedPost[];
  failed: AutoPublishFailedPost[];
};

type AutoPublishBatchOptions = {
  count: number;
  recencyDays: number;
  maxSources: number;
  now?: Date;
};

function getUtcDayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / 86400000);
}

function getSixHourSlotIndex(date: Date): number {
  return Math.floor(date.getUTCHours() / 6) % 4;
}

function selectTopic(date: Date, offset: number): AutoPublishTopic {
  const dayIndex = getUtcDayOfYear(date);
  const slotIndex = getSixHourSlotIndex(date);
  const index = (dayIndex * 4 + slotIndex + offset) % autoPublishTopics.length;
  return autoPublishTopics[index];
}

function buildUniqueSlug(base: string, date: Date, offset: number): string {
  const safeBase = normalizeBlogSlug(base).slice(0, 56).replace(/-+$/, "") || "auto-blog-post";
  const unixSeconds = Math.floor((date.getTime() + offset * 1000) / 1000);
  return `${safeBase}-${unixSeconds}`;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected auto-publish error";
}

export async function runAutoPublishBatch(options: AutoPublishBatchOptions): Promise<AutoPublishBatchResult> {
  const now = options.now ?? new Date();
  const requestedCount = Math.max(1, Math.min(options.count, 8));
  const recencyDays = Math.max(1, Math.min(options.recencyDays, 90));
  const maxSources = Math.max(3, Math.min(options.maxSources, 12));

  const created: AutoPublishCreatedPost[] = [];
  const failed: AutoPublishFailedPost[] = [];

  for (let index = 0; index < requestedCount; index += 1) {
    const topic = selectTopic(now, index);
    const slug = buildUniqueSlug(topic.titleEn, now, index);

    try {
      const packet = await runDeepResearchWorkflow({
        topic: topic.topic,
        angle: topic.angle,
        tags: topic.tags,
        recencyDays,
        maxSources,
        locale: topic.locale ?? "en",
      });

      const postResult = await createBlogPostFromResearch({
        packet,
        slug,
        titleEn: topic.titleEn,
        tags: topic.tags,
      });

      created.push({
        slug: postResult.slug,
        topic: topic.topic,
        packetId: packet.id,
        sourceCount: postResult.sourceCount,
        postPath: postResult.postPath,
      });
    } catch (error) {
      failed.push({
        topic: topic.topic,
        reason: toErrorMessage(error),
      });
    }
  }

  return {
    executedAt: new Date().toISOString(),
    requestedCount,
    createdCount: created.length,
    failedCount: failed.length,
    created,
    failed,
  };
}
