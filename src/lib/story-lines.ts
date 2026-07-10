import type { DemoNode, DialogueLine } from "./types";

export type StoryLine =
  | { kind: "narration"; text: string }
  | ({ kind: "dialogue" } & DialogueLine);

export function getStoryLines(node: DemoNode): StoryLine[] {
  const lines: StoryLine[] = [];

  if (node.narration.trim()) {
    lines.push({ kind: "narration", text: node.narration });
  }

  lines.push(
    ...node.dialogues.map((line) => ({
      ...line,
      kind: "dialogue" as const,
    })),
  );

  return lines.length > 0
    ? lines
    : [{ kind: "narration", text: node.summary || node.title }];
}
