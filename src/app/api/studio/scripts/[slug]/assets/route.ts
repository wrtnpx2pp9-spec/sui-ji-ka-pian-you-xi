import type { AssetType } from "@/lib/types";
import { assertCanEditScript, getCreatorSession } from "@/lib/creator-auth";
import { addStoredAsset, getStoredScriptBySlug } from "@/lib/script-store";

const assetTypes: AssetType[] = [
  "cover",
  "background",
  "character",
  "expression",
  "pose",
  "prop",
  "ui",
];

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
