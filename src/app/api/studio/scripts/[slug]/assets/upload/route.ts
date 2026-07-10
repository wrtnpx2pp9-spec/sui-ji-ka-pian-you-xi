import type { AssetType } from "@/lib/types";
import {
  saveStoredAssetFile,
  storedAssetTypes,
} from "@/lib/asset-folder-store";
import { assertCanEditScript, getCreatorSession } from "@/lib/creator-auth";
import { addStoredAsset, getStoredScriptBySlug } from "@/lib/script-store";

export const runtime = "nodejs";

async function getEditableScript(slug: string) {
  const session = await getCreatorSession();
  const script = await getStoredScriptBySlug(slug);

  if (!session) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  if (!script) {
    return { error: "Script not found" as const, status: 404 as const };
  }

  try {
    assertCanEditScript(session, script);
  } catch {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  if (
    session.role !== "admin" &&
    (script.status === "review" || script.status === "published")
  ) {
    return {
      error: "作品正在审核或已发布，不能直接编辑。请等待审核结果。" as const,
      status: 409 as const,
    };
  }

  return { session, script };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const permission = await getEditableScript(slug);

  if ("error" in permission) {
    return Response.json(
      { error: permission.error },
      { status: permission.status },
    );
  }

  const formData = await request.formData();
  const type = formData.get("type");
  const characterId = formData.get("characterId");
  const emotion = formData.get("emotion");
  const pose = formData.get("pose");
  const files = formData.getAll("files").filter((item): item is File => {
    return item instanceof File && item.size > 0;
  });

  if (
    typeof type !== "string" ||
    !storedAssetTypes.includes(type as AssetType) ||
    files.length === 0
  ) {
    return Response.json({ error: "Invalid upload input" }, { status: 400 });
  }

  const uploaded = [];

  for (const file of files) {
    const saved = await saveStoredAssetFile({
      slug,
      assetType: type as AssetType,
      fileName: file.name,
      buffer: Buffer.from(await file.arrayBuffer()),
    });

    const result = await addStoredAsset(slug, {
      type: type as AssetType,
      key: saved.key,
      name: saved.name,
      fileUrl: saved.fileUrl,
      characterId:
        typeof characterId === "string" ? characterId : undefined,
      emotion: typeof emotion === "string" ? emotion : undefined,
      pose: typeof pose === "string" ? pose : undefined,
    });

    if (!result) {
      return Response.json({ error: "Script not found" }, { status: 404 });
    }

    uploaded.push(result.asset);
  }

  return Response.json({ uploaded }, { status: 201 });
}
