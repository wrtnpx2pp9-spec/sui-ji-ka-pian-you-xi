import type { DemoNode, DemoScript, NodePresentation } from "./types";

export const presentationOptions: Array<{
  value: NodePresentation;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    value: "scene",
    label: "美术贴图 / 场景",
    shortLabel: "场景演出",
    description: "以背景、角色立绘、道具和分镜贴图承载剧情。",
  },
  {
    value: "chat",
    label: "手机聊天 / 私信",
    shortLabel: "聊天演出",
    description: "以手机私信、聊天记录和系统提示承载剧情。",
  },
];

export function isNodePresentation(value: unknown): value is NodePresentation {
  return value === "scene" || value === "chat";
}

export function getPresentationLabel(value: NodePresentation) {
  return (
    presentationOptions.find((option) => option.value === value)?.label ??
    presentationOptions[0].label
  );
}

export function getPresentationShortLabel(value: NodePresentation) {
  return (
    presentationOptions.find((option) => option.value === value)?.shortLabel ??
    presentationOptions[0].shortLabel
  );
}

export function getNodePresentation(
  node: DemoNode,
  script?: Pick<DemoScript, "defaultPresentation">,
): NodePresentation {
  return node.presentation ?? script?.defaultPresentation ?? "scene";
}

export function getScriptDefaultPresentation(
  script: Pick<DemoScript, "defaultPresentation" | "nodes">,
): NodePresentation {
  if (script.defaultPresentation) {
    return script.defaultPresentation;
  }

  const chatNodes = script.nodes.filter(
    (node) => getNodePresentation(node) === "chat",
  ).length;
  return chatNodes > script.nodes.length / 2 ? "chat" : "scene";
}
