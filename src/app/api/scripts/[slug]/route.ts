import { getStoredScriptBySlug } from "@/lib/script-store";
import {
  isPlayerAuthenticated,
  isScriptUnlocked,
  stripScriptSecrets,
} from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isPlayerAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script || script.status !== "published") {
    return Response.json({ error: "Script not found" }, { status: 404 });
  }

  if (!(await isScriptUnlocked(script))) {
    return Response.json({ error: "Script locked" }, { status: 403 });
  }

  return Response.json(stripScriptSecrets(script));
}
