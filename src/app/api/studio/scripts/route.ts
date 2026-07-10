import { isNodePresentation } from "@/lib/presentation";
import {
  readBackgroundDrafts,
  readCharacterDrafts,
  readNodeDrafts,
  readTags,
  type UnknownRecord,
} from "@/lib/script-request";
import { createStoredScript, readScripts } from "@/lib/script-store";
import { getCreatorSession } from "@/lib/creator-auth";

export async function GET() {
  const session = await getCreatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scripts = await readScripts();
  const visible =
    session.role === "admin"
      ? scripts
      : scripts.filter((script) => script.ownerId === session.id);

  return Response.json(visible);
}

export async function POST(request: Request) {
  const session = await getCreatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as UnknownRecord;

  if (
    typeof body.title !== "string" ||
    typeof body.description !== "string" ||
    typeof body.theme !== "string"
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const script = await createStoredScript({
    ownerId: session.id,
    title: body.title,
    slug: typeof body.slug === "string" ? body.slug : undefined,
    subtitle: typeof body.subtitle === "string" ? body.subtitle : undefined,
    description: body.description,
    theme: body.theme,
    style: typeof body.style === "string" ? body.style : undefined,
    tags: readTags(body.tagsText),
    targetAudience:
      typeof body.targetAudience === "string" ? body.targetAudience : undefined,
    contentWarning:
      typeof body.contentWarning === "string" ? body.contentWarning : undefined,
    accessPassword:
      typeof body.accessPassword === "string" ? body.accessPassword : undefined,
    defaultPresentation: isNodePresentation(body.defaultPresentation)
      ? body.defaultPresentation
      : undefined,
    estimatedMinutes:
      typeof body.estimatedMinutes === "number"
        ? body.estimatedMinutes
        : undefined,
    planning: {
      logline: typeof body.logline === "string" ? body.logline : undefined,
      playerGoal:
        typeof body.playerGoal === "string" ? body.playerGoal : undefined,
      mainConflict:
        typeof body.mainConflict === "string"
          ? body.mainConflict
          : undefined,
      tone: typeof body.tone === "string" ? body.tone : undefined,
      safetyBoundary:
        typeof body.safetyBoundary === "string"
          ? body.safetyBoundary
          : undefined,
    },
    characterDrafts: readCharacterDrafts(body.characterDrafts),
    backgroundDrafts: readBackgroundDrafts(body.backgroundDrafts),
    nodeDrafts: readNodeDrafts(body.nodeDrafts),
  });

  return Response.json(script, { status: 201 });
}
