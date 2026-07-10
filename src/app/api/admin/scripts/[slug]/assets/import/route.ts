import { importStoredAssetsFromFolder } from "@/lib/asset-folder-store";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";

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
  const result = await importStoredAssetsFromFolder(slug);

  if (!result) {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  return Response.json(result);
}
