import { createStoredScript, readScripts } from "@/lib/script-store";
import { isNodePresentation } from "@/lib/presentation";
import { assertCanReview, getCreatorSession } from "@/lib/creator-auth";
import {
  readBackgroundDrafts,
  readCharacterDrafts,
  readNodeDrafts,
  readTags,
  type UnknownRecord,
} from "@/lib/script-request";

export async function GET() {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const scripts = await readScripts();
  return Response.json(scripts);
}

export async function POST(request: Request) {
  try {
    assertCanReview(await getCreatorSession());
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as UnknownRecord;

  if (
    typeof body.title !== "string" ||
    typeof body.description !== "string" ||
    typeof body.theme !== "string"
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tags = readTags(body.tagsText);

  const script = await createStoredScript({
    title: body.title,
    slug: typeof body.slug === "string" ? body.slug : undefined,
    subtitle: typeof body.subtitle === "string" ? body.subtitle : undefined,
    description: body.description,
    theme: body.theme,
    style: typeof body.style === "string" ? body.style : undefined,
    tags,
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
