import { generatePersonaReply } from "@/lib/persona-chat";
import { getStoredScriptBySlug } from "@/lib/script-store";
import type { DemoNode } from "@/lib/types";

type ChatRequestBody = {
  slug?: unknown;
  nodeId?: unknown;
  message?: unknown;
  stats?: unknown;
};

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((item) => typeof item === "number")
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ChatRequestBody;

  if (
    typeof body.slug !== "string" ||
    typeof body.nodeId !== "string" ||
    typeof body.message !== "string" ||
    !body.message.trim()
  ) {
    return Response.json({ error: "Invalid chat request" }, { status: 400 });
  }

  const script = await getStoredScriptBySlug(body.slug);
  const node = script?.nodes.find(
    (item): item is DemoNode => item.id === body.nodeId,
  );

  if (!script || !node) {
    return Response.json({ error: "Script or node not found" }, { status: 404 });
  }

  if (node.presentation !== "chat" && script.defaultPresentation !== "chat") {
    return Response.json(
      { error: "Free chat is only available in chat nodes" },
      { status: 400 },
    );
  }

  const stats = isNumberRecord(body.stats) ? body.stats : {};
  const result = await generatePersonaReply({
    script,
    node,
    userMessage: body.message.trim(),
    stats,
  });

  return Response.json({
    reply: result.reply,
    responder: {
      id: result.character.id,
      key: result.character.key,
      name: result.character.name,
    },
  });
}
