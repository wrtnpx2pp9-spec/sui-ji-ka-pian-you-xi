import { assertCanEditScript, getCreatorSession } from "@/lib/creator-auth";
import {
  deleteStoredNode,
  getStoredScriptBySlug,
  updateStoredNode,
} from "@/lib/script-store";

async function canEdit(slug: string) {
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

  return { script };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; nodeId: string }> },
) {
  const { slug, nodeId } = await params;
  const allowed = await canEdit(slug);

  if ("error" in allowed) {
    return Response.json({ error: allowed.error }, { status: allowed.status });
  }

  const patch = await request.json();
  const node = await updateStoredNode(slug, nodeId, patch);

  if (!node) {
    return Response.json({ error: "Node not found" }, { status: 404 });
  }

  return Response.json(node);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; nodeId: string }> },
) {
  const { slug, nodeId } = await params;
  const allowed = await canEdit(slug);

  if ("error" in allowed) {
    return Response.json({ error: allowed.error }, { status: allowed.status });
  }

  const node = await deleteStoredNode(slug, nodeId);

  if (!node) {
    return Response.json(
      { error: "Node not found or cannot delete start node" },
      { status: 404 },
    );
  }

  return Response.json(node);
}
