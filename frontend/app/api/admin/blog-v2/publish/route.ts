import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/admin-access";
import { publishBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { blogV2PublishInputSchema } from "@/lib/blog-v2/pipeline/types";
import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const access = await resolveAdminAccess();
  if (!access.actor) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = blogV2PublishInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid publish payload.",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  try {
    const result = await publishBlogV2Draft(parsed.data);

    revalidatePath("/blog");
    revalidatePath(`/blog/${result.slug}`);
    revalidatePath("/sitemap.xml");
    revalidateTag(BLOG_POSTS_CACHE_TAG, "max");

    return NextResponse.json({
      ok: true,
      actor: access.actor.source,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Publish failed.",
      },
      { status: 500 },
    );
  }
}
