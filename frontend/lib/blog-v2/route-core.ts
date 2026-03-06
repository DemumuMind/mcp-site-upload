import type { ZodType } from "zod";

type RouteCoreDeps<TInput, TResult> = {
  parseJsonBody: () => Promise<unknown>;
  schema: ZodType<TInput>;
  invalidJsonMessage: string;
  invalidPayloadMessage: string;
  executionErrorMessage: string;
  run: (input: TInput) => Promise<TResult> | TResult;
  shapeSuccess: (result: TResult) => Record<string, unknown>;
};

export async function executeAdminJsonRoute<TInput, TResult>(
  deps: RouteCoreDeps<TInput, TResult>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  let body: unknown;
  try {
    body = await deps.parseJsonBody();
  } catch {
    return {
      status: 400,
      body: {
        ok: false,
        message: deps.invalidJsonMessage,
      },
    };
  }

  const parsed = deps.schema.safeParse(body);
  if (!parsed.success) {
    return {
      status: 422,
      body: {
        ok: false,
        message: deps.invalidPayloadMessage,
        issues: parsed.error.issues,
      },
    };
  }

  try {
    const result = await deps.run(parsed.data);
    return {
      status: 200,
      body: {
        ok: true,
        ...deps.shapeSuccess(result),
      },
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        ok: false,
        message: error instanceof Error ? error.message : deps.executionErrorMessage,
      },
    };
  }
}
