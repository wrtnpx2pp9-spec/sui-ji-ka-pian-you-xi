import { ensureStoredAssetFolders } from "@/lib/asset-folder-store";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";
import { getStoredScriptBySlug } from "@/lib/script-store";

export async function POST(
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

  const folder = await ensureStoredAssetFolders(slug);

  return Response.json(folder);
}
