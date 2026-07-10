import type { AssetType } from "@/lib/types";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";
import { addStoredAsset } from "@/lib/script-store";

const assetTypes: AssetType[] = [
  "cover",
  "background",
  "character",
  "expression",
  "pose",
  "prop",
  "ui",
];

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
  const body = await request.json().catch(() => ({}));

  if (
    typeof body.name !== "string" ||
    typeof body.key !== "string" ||
    typeof body.fileUrl !== "string" ||
    typeof body.type !== "string" ||
    !assetTypes.includes(body.type as AssetType)
  ) {
    return Response.json({ error: "Invalid asset input" }, { status: 400 });
  }

  const result = await addStoredAsset(slug, {
    type: body.type as AssetType,
    key: body.key,
    name: body.name,
    fileUrl: body.fileUrl,
    characterId:
      typeof body.characterId === "string" ? body.characterId : undefined,
    emotion: typeof body.emotion === "string" ? body.emotion : undefined,
    pose: typeof body.pose === "string" ? body.pose : undefined,
  });

  if (!result) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  return Response.json(result, { status: 201 });
}
