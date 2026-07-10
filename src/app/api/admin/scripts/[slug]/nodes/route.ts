import { addStoredNode } from "@/lib/script-store";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";

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
  const result = await addStoredNode(slug, body?.parentNodeId);

  if (!result) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  return Response.json(result);
}
