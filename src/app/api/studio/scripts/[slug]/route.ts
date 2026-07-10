import { deleteStoredAssetFolder } from "@/lib/asset-folder-store";
import {
  assertCanEditScript,
  getCreatorSession,
} from "@/lib/creator-auth";
import {
  deleteStoredScript,
  getStoredScriptBySlug,
  updateStoredScript,
} from "@/lib/script-store";

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

  return { session, script };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const result = await getEditableScript(slug);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.script);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const result = await getEditableScript(slug);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const patch = await request.json();

  if (
    result.session.role !== "admin" &&
    (result.script.status === "review" || result.script.status === "published")
  ) {
    return Response.json(
      { error: "作品正在审核或已发布，不能直接编辑。请等待审核结果。" },
      { status: 409 },
    );
  }

  const script = await updateStoredScript(slug, {
    ...patch,
    ownerId: result.script.ownerId,
    status:
      result.script.status === "published" || result.script.status === "review"
        ? result.script.status
        : (patch.status ?? result.script.status),
  });

  if (!script) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  return Response.json(script);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const result = await getEditableScript(slug);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const script = await deleteStoredScript(slug);

  if (!script) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  await deleteStoredAssetFolder(slug);

  return Response.json({ ok: true, script });
}
