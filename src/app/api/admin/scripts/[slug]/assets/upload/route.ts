import type { AssetType } from "@/lib/types";
import {
  saveStoredAssetFile,
  storedAssetTypes,
} from "@/lib/asset-folder-store";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";
import { addStoredAsset } from "@/lib/script-store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
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
