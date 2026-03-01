import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/admin-access";
import { createBlogV2Draft, previewBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { blogV2GenerateInputSchema } from "@/lib/blog-v2/pipeline/types";

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

  const parsed = blogV2GenerateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid request payload.",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  try {
    const draft = await createBlogV2Draft(parsed.data);
    const preview = previewBlogV2Draft(draft);

    return NextResponse.json({
      ok: true,
      actor: access.actor.source,
      draft,
      preview,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Draft generation failed.",
      },
      { status: 500 },
    );
  }
}
