import type { DemoNode, DemoScript } from "./types";

export type PlayStats = Record<string, number>;

export function createInitialStats(script: DemoScript): PlayStats {
  return Object.fromEntries(
    script.stats.map((stat) => [stat.key, stat.initialValue]),
  );
}

export function applyStatDelta(stats: PlayStats, delta: Record<string, number>) {
  const next = { ...stats };

  for (const [key, value] of Object.entries(delta)) {
    const current = next[key] ?? 0;
    next[key] = Math.max(0, Math.min(100, current + value));
  }

  return next;
}

export function getStartNode(script: DemoScript): DemoNode {
  return (
    script.nodes.find((node) => node.nodeType === "start") ?? script.nodes[0]
  );
}

export function getNode(script: DemoScript, nodeId: string): DemoNode {
  const node = script.nodes.find((item) => item.id === nodeId);

  if (!node) {
    return getStartNode(script);
  }

  return node;
}

export function getAsset(script: DemoScript, assetId: string) {
  return script.assets.find((asset) => asset.id === assetId);
}

export function getCharacter(script: DemoScript, characterId: string) {
  return script.characters.find((character) => character.id === characterId);
}

export function formatDelta(delta: Record<string, number>, script: DemoScript) {
  return Object.entries(delta)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => {
      const stat = script.stats.find((item) => item.key === key);
      const name = stat?.name ?? key;
      return `${name} ${value > 0 ? "+" : ""}${value}`;
    });
}
