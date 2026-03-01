import { createLogger } from "@/lib/api/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type MultiAgentTaskEventType =
  | "task_received"
  | "task_completed"
  | "task_failed"
  | "fallback_triggered";

export type MultiAgentTaskEventStatus = "started" | "success" | "failed";

type EmitTaskEventInput = {
  requestId: string;
  eventType: MultiAgentTaskEventType;
  status?: MultiAgentTaskEventStatus;
  stage?: string;
  payload?: Record<string, unknown>;
};

const logger = createLogger("multi_agent.task_events");

export async function emitMultiAgentTaskEvent(input: EmitTaskEventInput): Promise<void> {
  const payload = input.payload ?? {};

  logger.info("emit", {
    requestId: input.requestId,
    eventType: input.eventType,
    status: input.status,
    stage: input.stage,
    payload,
  });

  try {
    const admin = createSupabaseAdminClient();
    if (!admin) {
      return;
    }

    const { error } = await admin.from("multi_agent_task_events").insert({
      request_id: input.requestId,
      event_type: input.eventType,
      status: input.status ?? null,
      stage: input.stage ?? null,
      payload,
    });

    if (error) {
      logger.warn("insert_failed", {
        requestId: input.requestId,
        eventType: input.eventType,
        message: error.message,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown task event telemetry error";
    logger.warn("insert_threw", {
      requestId: input.requestId,
      eventType: input.eventType,
      message,
    });
  }
}
