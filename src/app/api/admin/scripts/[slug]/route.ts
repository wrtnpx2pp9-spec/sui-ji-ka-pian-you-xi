import { deleteStoredAssetFolder } from "@/lib/asset-folder-store";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";
import {
  deleteStoredScript,
  getStoredScriptBySlug,
  updateStoredScript,
} from "@/lib/script-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  return Response.json(script);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  const patch = await request.json();
  const script = await updateStoredScript(slug, patch);

  if (!script) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  return Response.json(script);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  const script = await deleteStoredScript(slug);

  if (!script) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  await deleteStoredAssetFolder(slug);

  return Response.json({ ok: true, script });
}
