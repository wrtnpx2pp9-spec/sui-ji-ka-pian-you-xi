import { isNodePresentation } from "@/lib/presentation";
import type { DemoNode } from "@/lib/types";

export type UnknownRecord = Record<string, unknown>;

export function readTags(value: unknown) {
  return typeof value === "string"
    ? value
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
}

export function readCharacterDrafts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is UnknownRecord =>
      Boolean(item && typeof item === "object"),
    )
    .map((item) => ({
      key: typeof item.key === "string" ? item.key : undefined,
      name: typeof item.name === "string" ? item.name : "",
      roleType: typeof item.roleType === "string" ? item.roleType : undefined,
      description:
        typeof item.description === "string" ? item.description : undefined,
    }))
    .filter((item) => item.name.trim());
}

export function readBackgroundDrafts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is UnknownRecord =>
      Boolean(item && typeof item === "object"),
    )
    .map((item) => ({
      key: typeof item.key === "string" ? item.key : undefined,
      name: typeof item.name === "string" ? item.name : "",
      fileUrl: typeof item.fileUrl === "string" ? item.fileUrl : "",
    }))
    .filter((item) => item.name.trim() && item.fileUrl.trim());
}

export function readNodeDrafts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is UnknownRecord =>
      Boolean(item && typeof item === "object"),
    )
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      chapter: typeof item.chapter === "string" ? item.chapter : undefined,
      summary: typeof item.summary === "string" ? item.summary : undefined,
      goal: typeof item.goal === "string" ? item.goal : undefined,
      tone: typeof item.tone === "string" ? item.tone : undefined,
      nodeType: readNodeType(item.nodeType),
      presentation: isNodePresentation(item.presentation)
        ? item.presentation
        : undefined,
      choices: readDraftChoices(item.choices),
    }))
    .filter((item) => item.title.trim());
}

export function readNodeType(value: unknown): DemoNode["nodeType"] | undefined {
  return typeof value === "string" &&
    ["start", "normal", "event", "choice", "ending"].includes(value)
    ? (value as DemoNode["nodeType"])
    : undefined;
}

export function readDraftChoices(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is UnknownRecord =>
      Boolean(item && typeof item === "object"),
    )
    .map((item) => ({
      text: typeof item.text === "string" ? item.text : "",
      targetIndex:
        typeof item.targetIndex === "number" ? item.targetIndex : -1,
    }))
    .filter((item) => item.text.trim() && item.targetIndex >= 0);
}
