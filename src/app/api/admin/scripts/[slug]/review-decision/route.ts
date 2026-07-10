import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";
import { getScriptAssetRequirements } from "@/lib/asset-requirements";
import { getScriptHealth } from "@/lib/script-health";
import { getStoredScriptBySlug, updateStoredScript } from "@/lib/script-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getCreatorSession();

  try {
    assertCanReview(session);
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action;
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (action !== "approve" && action !== "reject") {
    return Response.json({ error: "Invalid review action" }, { status: 400 });
  }

  if (action === "approve") {
    const health = getScriptHealth(script);
    const requirements = getScriptAssetRequirements(script);

    if (
      health.blockingNodes > 0 ||
      health.highlights.some((item) => item.severity === "error") ||
      requirements.missing.length > 0 ||
      !script.assets.every((asset) => asset.status === "approved")
    ) {
      return Response.json(
        { error: "作品仍有阻塞项或美术缺口，暂不能发布。", health, requirements },
        { status: 400 },
      );
    }
  }

  const next = await updateStoredScript(slug, {
    status: action === "approve" ? "published" : "editing",
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes,
  });

  return Response.json(next);
}
