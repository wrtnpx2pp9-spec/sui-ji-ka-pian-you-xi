import { ensureStoredAssetFolders } from "@/lib/asset-folder-store";
import { assertCanEditScript, getCreatorSession } from "@/lib/creator-auth";
import { getStoredScriptBySlug } from "@/lib/script-store";

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

  if (
    session.role !== "admin" &&
    (script.status === "review" || script.status === "published")
  ) {
    return Response.json(
      { error: "作品正在审核或已发布，不能直接编辑。请等待审核结果。" },
      { status: 409 },
    );
  }

  const folder = await ensureStoredAssetFolders(slug);

  return Response.json(folder);
}
