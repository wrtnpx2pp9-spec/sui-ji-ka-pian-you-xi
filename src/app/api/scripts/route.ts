import { readScripts } from "@/lib/script-store";
import { isPlayerAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isPlayerAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scripts = await readScripts();

  return Response.json(
    scripts
      .filter((script) => script.status === "published")
      .map((script) => ({
        id: script.id,
        slug: script.slug,
        title: script.title,
        subtitle: script.subtitle,
        description: script.description,
        theme: script.theme,
        tags: script.tags,
        estimatedMinutes: script.estimatedMinutes,
        requiresPassword: Boolean(script.accessPassword?.trim()),
        cover: script.assets.find((asset) => asset.type === "cover") ?? null,
      })),
  );
}
