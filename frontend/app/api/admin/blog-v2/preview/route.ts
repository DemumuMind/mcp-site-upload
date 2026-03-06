import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/admin-access";
import { previewBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { blogV2DraftSchema } from "@/lib/blog-v2/pipeline/types";
import { executeAdminJsonRoute } from "@/lib/blog-v2/route-core";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const access = await resolveAdminAccess();
  if (!access.actor) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const actorSource = access.actor.source;

  const response = await executeAdminJsonRoute({
    parseJsonBody: () => request.json(),
    schema: {
      safeParse(input: unknown) {
        return blogV2DraftSchema.safeParse((input as { draft?: unknown })?.draft ?? input);
      },
    } as typeof blogV2DraftSchema,
    invalidJsonMessage: "Invalid JSON payload.",
    invalidPayloadMessage: "Invalid draft payload.",
    executionErrorMessage: "Preview failed.",
    run: (input) => previewBlogV2Draft(input),
    shapeSuccess: (preview) => ({
      actor: actorSource,
      preview,
    }),
  });

  return NextResponse.json(response.body, { status: response.status });
}
