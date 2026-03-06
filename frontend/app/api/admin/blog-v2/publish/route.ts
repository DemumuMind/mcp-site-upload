import { NextResponse } from "next/server";
import { resolveAdminApiAccess } from "@/lib/admin-access";
import { invalidateBlogCaches } from "@/lib/cache/invalidation";
import { publishBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { blogV2PublishInputSchema } from "@/lib/blog-v2/pipeline/types";
import { executeAdminJsonRoute } from "@/lib/blog-v2/route-core";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const access = await resolveAdminApiAccess(request);
  if (!access.actor) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const actorSource = access.actor.source;

  const response = await executeAdminJsonRoute({
    parseJsonBody: () => request.json(),
    schema: blogV2PublishInputSchema,
    invalidJsonMessage: "Invalid JSON payload.",
    invalidPayloadMessage: "Invalid publish payload.",
    executionErrorMessage: "Publish failed.",
    run: async (input) => {
      const result = await publishBlogV2Draft(input);
      invalidateBlogCaches({
        origin: "route",
        slugs: [result.slug],
      });
      return result;
    },
    shapeSuccess: (result) => ({
      actor: actorSource,
      result,
    }),
  });

  return NextResponse.json(response.body, { status: response.status });
}
