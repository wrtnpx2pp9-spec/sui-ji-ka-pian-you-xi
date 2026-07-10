import { assertCanEditScript, getCreatorSession } from "@/lib/creator-auth";
import { getScriptHealth } from "@/lib/script-health";
import { getStoredScriptBySlug, updateStoredScript } from "@/lib/script-store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getCreatorSession();
  const script = await getStoredScriptBySlug(slug);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!script) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  try {
    assertCanEditScript(session, script);
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const health = getScriptHealth(script);

  if (health.blockingNodes > 0 || health.highlights.some((item) => item.severity === "error")) {
    return Response.json(
      { error: "作品仍有必须修复的错误，不能提交审核。", health },
      { status: 400 },
    );
  }

  const next = await updateStoredScript(slug, {
    status: "review",
    submittedAt: new Date().toISOString(),
    reviewNotes: "",
  });

  return Response.json(next);
}
