import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/admin-access";
import { createBlogV2Draft, previewBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { blogV2GenerateInputSchema } from "@/lib/blog-v2/pipeline/types";
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
    schema: blogV2GenerateInputSchema,
    invalidJsonMessage: "Invalid JSON payload.",
    invalidPayloadMessage: "Invalid request payload.",
    executionErrorMessage: "Draft generation failed.",
    run: async (input) => {
      const draft = await createBlogV2Draft(input);
      return {
        draft,
        preview: previewBlogV2Draft(draft),
      };
    },
    shapeSuccess: (result) => ({
      actor: actorSource,
      draft: result.draft,
      preview: result.preview,
    }),
  });

  return NextResponse.json(response.body, { status: response.status });
}
