import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { resolveAdminApiAccess } from "@/lib/admin-access";
import { publishBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { blogV2PublishInputSchema } from "@/lib/blog-v2/pipeline/types";
import { executeAdminJsonRoute } from "@/lib/blog-v2/route-core";
import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog/service";

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
      revalidatePath("/blog");
      revalidatePath(`/blog/${result.slug}`);
      revalidatePath("/sitemap.xml");
      revalidateTag(BLOG_POSTS_CACHE_TAG, "max");
      return result;
    },
    shapeSuccess: (result) => ({
      actor: actorSource,
      result,
    }),
  });

  return NextResponse.json(response.body, { status: response.status });
}
