import {
  deleteStoredNode,
  generateStoredNodeDraft,
  updateStoredNode,
} from "@/lib/script-store";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; nodeId: string }> },
) {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, nodeId } = await params;
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
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, nodeId } = await params;
  const node = await deleteStoredNode(slug, nodeId);

  if (!node) {
    return Response.json(
      { error: "Node not found or cannot delete start node" },
      { status: 404 },
    );
  }

  return Response.json(node);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; nodeId: string }> },
) {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, nodeId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body?.action !== "generate_draft") {
    return Response.json({ error: "Unsupported action" }, { status: 400 });
  }

  const node = await generateStoredNodeDraft(slug, nodeId);

  if (!node) {
    return Response.json({ error: "Node not found" }, { status: 404 });
  }

  return Response.json(node);
}
