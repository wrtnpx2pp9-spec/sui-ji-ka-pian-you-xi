import type { DemoNode, NodePresentation } from "./types";

export type DagDraftChoice = {
  id: string;
  text: string;
  targetId: string;
};

export type DagDraftNode = {
  id: string;
  title: string;
  chapter: string;
  summary: string;
  goal: string;
  tone: string;
  nodeType: DemoNode["nodeType"];
  presentation: NodePresentation;
  choices: DagDraftChoice[];
};

function createDraftId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createOpeningDagNode(): DagDraftNode {
  return {
    id: "opening",
    title: "开场",
    chapter: "第一章",
    summary: "写下玩家进入故事时看到的第一幕。",
    goal: "建立主角处境、核心冲突和第一个判断点。",
    tone: "按你的故事气质填写",
    nodeType: "start",
    presentation: "scene",
    choices: [],
  };
}

export function createBlankDagNode(index: number): DagDraftNode {
  return {
    id: createDraftId("node"),
    title: `新节点 ${index}`,
    chapter: "待定章节",
    summary: "写下这个节点里真正发生的事。",
    goal: "写下这个节点要把剧情推向哪里。",
    tone: "按你的故事气质填写",
    nodeType: "normal",
    presentation: "scene",
    choices: [],
  };
}

export function createsCycle(
  nodes: DagDraftNode[],
  sourceId: string,
  targetId: string,
) {
  if (sourceId === targetId) {
    return true;
  }

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visited = new Set<string>();
  const stack = [targetId];

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (!currentId || visited.has(currentId)) {
      continue;
    }

    if (currentId === sourceId) {
      return true;
    }

    visited.add(currentId);
    const node = byId.get(currentId);

    if (node) {
      stack.push(...node.choices.map((choice) => choice.targetId));
    }
  }

  return false;
}

export function updateDagNode(
  nodes: DagDraftNode[],
  nodeId: string,
  patch: Partial<DagDraftNode>,
) {
  return nodes.map((node) =>
    node.id === nodeId ? { ...node, ...patch, id: node.id } : node,
  );
}

export function removeDagNode(nodes: DagDraftNode[], nodeId: string) {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      choices: node.choices.filter((choice) => choice.targetId !== nodeId),
    }));
}

export function addDownstreamNode(nodes: DagDraftNode[], sourceId: string) {
  const nextNode = createBlankDagNode(nodes.length + 1);
  const nextNodes = nodes.map((node) =>
    node.id === sourceId
      ? {
          ...node,
          choices: [
            ...node.choices,
            {
              id: createDraftId("choice"),
              text: `进入「${nextNode.title}」`,
              targetId: nextNode.id,
            },
          ],
        }
      : node,
  );

  return {
    nodes: [...nextNodes, nextNode],
    selectedId: nextNode.id,
  };
}

export function addChoiceToExistingTarget(
  nodes: DagDraftNode[],
  sourceId: string,
  targetId: string,
) {
  if (createsCycle(nodes, sourceId, targetId)) {
    return {
      nodes,
      error: "这个走向会形成回环。DAG 只能向下分支，不能连回自己或上游节点。",
    };
  }

  const target = nodes.find((node) => node.id === targetId);
  const nextNodes = nodes.map((node) =>
    node.id === sourceId
      ? {
          ...node,
          choices: [
            ...node.choices,
            {
              id: createDraftId("choice"),
              text: target ? `进入「${target.title}」` : "新的走向",
              targetId,
            },
          ],
        }
      : node,
  );

  return { nodes: nextNodes };
}

export function updateDagChoice(
  nodes: DagDraftNode[],
  sourceId: string,
  choiceId: string,
  patch: Partial<DagDraftChoice>,
) {
  const nextTargetId = patch.targetId;

  if (nextTargetId && createsCycle(nodes, sourceId, nextTargetId)) {
    return {
      nodes,
      error: "这个目标会让剧情图成环，请换一个下游节点。",
    };
  }

  return {
    nodes: nodes.map((node) =>
      node.id === sourceId
        ? {
            ...node,
            choices: node.choices.map((choice) =>
              choice.id === choiceId ? { ...choice, ...patch } : choice,
            ),
          }
        : node,
    ),
  };
}

export function deleteDagChoice(
  nodes: DagDraftNode[],
  sourceId: string,
  choiceId: string,
) {
  return nodes.map((node) =>
    node.id === sourceId
      ? {
          ...node,
          choices: node.choices.filter((choice) => choice.id !== choiceId),
        }
      : node,
  );
}

export function validateDagDraft(nodes: DagDraftNode[]) {
  if (nodes.length === 0) {
    return "至少需要一个开场节点。";
  }

  const ids = new Set(nodes.map((node) => node.id));

  for (const node of nodes) {
    if (!node.title.trim()) {
      return "每个节点都需要标题。";
    }

    for (const choice of node.choices) {
      if (!choice.text.trim()) {
        return `「${node.title}」有一个走向缺少文案。`;
      }

      if (!ids.has(choice.targetId)) {
        return `「${node.title}」有一个走向指向了不存在的节点。`;
      }

      if (createsCycle(nodes, node.id, choice.targetId)) {
        return `「${node.title}」有一个走向形成了回环。`;
      }
    }
  }

  return null;
}

export function toApiNodeDrafts(nodes: DagDraftNode[]) {
  const indexById = new Map(nodes.map((node, index) => [node.id, index]));

  return nodes.map((node) => ({
    title: node.title,
    chapter: node.chapter,
    summary: node.summary,
    goal: node.goal,
    tone: node.tone,
    nodeType: node.nodeType,
    presentation: node.presentation,
    choices: node.choices.map((choice) => ({
      text: choice.text,
      targetIndex: indexById.get(choice.targetId) ?? 0,
    })),
  }));
}
