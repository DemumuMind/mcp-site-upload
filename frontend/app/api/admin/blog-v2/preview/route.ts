import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/admin-access";
import { previewBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { blogV2DraftSchema } from "@/lib/blog-v2/pipeline/types";

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

  const parsed = blogV2DraftSchema.safeParse((body as { draft?: unknown })?.draft ?? body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid draft payload.",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  const preview = previewBlogV2Draft(parsed.data);
  return NextResponse.json({
    ok: true,
    actor: access.actor.source,
    preview,
  });
}
