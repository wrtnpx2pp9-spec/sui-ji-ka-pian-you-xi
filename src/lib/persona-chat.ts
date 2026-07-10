import { callConfiguredModel, type ModelMessage } from "./model-api-client";
import type { DemoCharacter, DemoNode, DemoScript, DialogueLine } from "./types";

export type PersonaChatInput = {
  script: DemoScript;
  node: DemoNode;
  userMessage: string;
  stats: Record<string, number>;
};

function findResponder(script: DemoScript, node: DemoNode) {
  const configuredId = node.chatConfig?.responderCharacterId;
  const boundCharacterIds = node.characterBindings.map(
    (binding) => binding.characterId,
  );

  return (
    script.characters.find(
      (character) =>
        character.id === configuredId || character.key === configuredId,
    ) ??
    script.characters.find(
      (character) =>
        boundCharacterIds.includes(character.id) &&
        character.roleType !== "protagonist" &&
        character.roleType !== "system",
    ) ??
    script.characters.find(
      (character) =>
        character.roleType !== "protagonist" &&
        character.roleType !== "system",
    ) ??
    script.characters[0]
  );
}

function formatStats(script: DemoScript, stats: Record<string, number>) {
  return script.stats
    .map((stat) => `${stat.name}: ${stats[stat.key] ?? stat.initialValue}`)
    .join("；");
}

function buildMessages({
  script,
  node,
  character,
  userMessage,
  stats,
}: PersonaChatInput & { character: DemoCharacter }): ModelMessage[] {
  const systemPrompt =
    character.aiProfile?.systemPrompt ||
    [
      `你正在扮演互动剧情里的角色「${character.name}」。`,
      `角色设定：${character.description}`,
      `性格：${character.personality}`,
      `剧情功能：${character.narrativeFunction}`,
      `当前节点：${node.title}`,
      `节点发生的事：${node.summary}`,
      `作者意图：${node.goal}`,
      `当前状态：${formatStats(script, stats)}`,
      "你只能回复当前聊天中的一句话，不要替玩家做选择，不要新增剧情节点。",
      "回复应自然、有轻微不确定性，但必须符合人设和当前节点目标。",
      "不要输出 JSON，不要解释你是模型。",
    ].join("\n");

  return [
    { role: "system", content: systemPrompt },
    ...node.dialogues.slice(-6).map<ModelMessage>((line) => ({
      role:
        line.speaker === "player" || line.chatSide === "outgoing"
          ? "user"
          : "assistant",
      content: line.text,
    })),
    { role: "user", content: userMessage },
  ];
}

function fallbackReply(character: DemoCharacter, node: DemoNode, userMessage: string) {
  const fragments = [
    `你这么说，我会认真想一下。`,
    `我明白你的意思，但这件事没有你想得那么简单。`,
    `先别急着下判断，我们可以再聊清楚一点。`,
    `如果你在意的是「${node.title}」，那我也想听听你真正担心什么。`,
  ];
  const seed =
    Array.from(userMessage).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    fragments.length;

  return `${fragments[seed]}${
    character.aiProfile?.replyStyle ? ` ${character.aiProfile.replyStyle}` : ""
  }`;
}

export async function generatePersonaReply(input: PersonaChatInput) {
  const character = findResponder(input.script, input.node);

  if (!character) {
    throw new Error("No responder character configured");
  }

  const messages = buildMessages({ ...input, character });
  const text =
    (await callConfiguredModel({
      messages,
      temperature: character.aiProfile?.temperature ?? 0.85,
    })) ?? fallbackReply(character, input.node, input.userMessage);

  const reply: DialogueLine = {
    speaker: character.key,
    emotion: "dynamic",
    text: text.trim().slice(0, 500),
    chatSide: "incoming",
    chatKind: "text",
    deliveryStatus: "read",
  };

  return { reply, character };
}
