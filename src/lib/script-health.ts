import { getNodePresentation } from "@/lib/presentation";
import type { DemoNode, DemoScript, NodePresentation } from "@/lib/types";

export type HealthIssue = {
  severity: "error" | "warning";
  title: string;
  detail: string;
};

export type NodeHealth = {
  score: number;
  issues: HealthIssue[];
};

export type ScriptHealth = {
  score: number;
  totalNodes: number;
  blockingNodes: number;
  warningNodes: number;
  unreachableNodes: number;
  deadEndNodes: number;
  missingSceneBackgrounds: number;
  missingCharacterArt: number;
  highlights: HealthIssue[];
};

export function getNodeHealth({
  node,
  nodes,
  presentation,
  backgroundAssetIds,
  characterAssetIds,
  characterIds,
}: {
  node: DemoNode;
  nodes: DemoNode[];
  presentation: NodePresentation;
  backgroundAssetIds: Set<string>;
  characterAssetIds: Set<string>;
  characterIds: Set<string>;
}): NodeHealth {
  const issues: HealthIssue[] = [];
  const targetIds = new Set(nodes.map((item) => item.id));
  const hasIncoming = nodes.some((item) =>
    item.choices.some((choice) => choice.nextNodeId === node.id),
  );
  const hasNarrativeText =
    node.narration.trim() || node.dialogues.some((line) => line.text.trim());

  if (!node.title.trim()) {
    issues.push({
      severity: "error",
      title: "缺少节点标题",
      detail: "标题会出现在剧情图和玩家端顶部，保存前需要补齐。",
    });
  }

  if (!node.chapter.trim()) {
    issues.push({
      severity: "warning",
      title: "缺少章节名",
      detail: "章节名能帮助作者和玩家理解当前进度。",
    });
  }

  if (!node.summary.trim() || !node.goal.trim()) {
    issues.push({
      severity: "warning",
      title: "作者把控信息不完整",
      detail: "建议补齐发生事件和剧情目标，后续持续生产会更稳定。",
    });
  }

  if (!hasNarrativeText) {
    issues.push({
      severity: "error",
      title: "缺少可播放正文",
      detail: "至少需要一段旁白或一条对白，否则玩家进入节点时没有内容可看。",
    });
  }

  if (node.nodeType !== "start" && !hasIncoming) {
    issues.push({
      severity: "warning",
      title: "没有上游入口",
      detail: "当前节点暂时不会被任何选项进入，除非它是临时草稿节点。",
    });
  }

  if (node.nodeType === "ending" && node.choices.length > 0) {
    issues.push({
      severity: "warning",
      title: "结局节点仍有选项",
      detail: "结局通常应该收束体验；如果要继续，请确认它不是 ending 类型。",
    });
  }

  if (node.nodeType !== "ending" && node.choices.length === 0) {
    issues.push({
      severity: "warning",
      title: "缺少后续选项",
      detail: "非结局节点建议至少配置一个走向，避免玩家停在这里。",
    });
  }

  const seenChoiceTexts = new Set<string>();
  for (const choice of node.choices) {
    const choiceText = choice.text.trim();

    if (!choiceText) {
      issues.push({
        severity: "error",
        title: "选项文案为空",
        detail: "每个选项都需要玩家能理解的按钮文案。",
      });
    }

    if (choiceText && seenChoiceTexts.has(choiceText)) {
      issues.push({
        severity: "warning",
        title: "选项文案重复",
        detail: "重复选项会让玩家分不清不同走向。",
      });
    }

    if (choiceText) {
      seenChoiceTexts.add(choiceText);
    }

    if (!choice.nextNodeId || !targetIds.has(choice.nextNodeId)) {
      issues.push({
        severity: "error",
        title: "选项目标失效",
        detail: `“${choice.text || "未命名选项"}”没有指向有效节点。`,
      });
    }

    if (choice.nextNodeId === node.id) {
      issues.push({
        severity: "error",
        title: "选项指回自身",
        detail: "当前 DAG 结构应向下推进，不能把选项连回当前节点。",
      });
    }
  }

  if (presentation === "scene") {
    if (!node.backgroundAssetId) {
      issues.push({
        severity: "warning",
        title: "未绑定场景图",
        detail: "玩家端会使用默认贴图，正式内容建议绑定自己的背景美术。",
      });
    } else if (!backgroundAssetIds.has(node.backgroundAssetId)) {
      issues.push({
        severity: "error",
        title: "场景图资源失效",
        detail: "当前 backgroundAssetId 在资源库里找不到。",
      });
    }

    if (node.characterBindings.length === 0) {
      issues.push({
        severity: "warning",
        title: "未绑定角色立绘",
        detail: "场景节点可以没有人物，但互动短剧通常需要至少一个可见角色。",
      });
    }
  }

  for (const binding of node.characterBindings) {
    if (!characterIds.has(binding.characterId)) {
      issues.push({
        severity: "error",
        title: "角色绑定失效",
        detail: "某个立绘绑定的角色已经不存在。",
      });
    }

    if (!binding.assetId || !characterAssetIds.has(binding.assetId)) {
      issues.push({
        severity: "error",
        title: "立绘资源失效",
        detail: "某个角色绑定缺少可用的 character / expression / pose 资源。",
      });
    }
  }

  if (presentation === "chat") {
    if (!node.chatConfig?.contactName?.trim()) {
      issues.push({
        severity: "warning",
        title: "聊天联系人未配置",
        detail: "建议设置联系人名称，让玩家知道正在和谁对话。",
      });
    }

    for (const line of node.dialogues) {
      if (!line.speaker.trim() || !line.text.trim()) {
        issues.push({
          severity: "error",
          title: "聊天消息不完整",
          detail: "每条聊天消息都需要说话人和消息内容。",
        });
      }
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;
  const score = Math.max(0, 100 - errorCount * 22 - warningCount * 9);

  return { score, issues };
}

export type ScriptHealthOptions = {
  nodes?: DemoNode[];
  backgroundAssetIds?: Set<string>;
  characterAssetIds?: Set<string>;
  characterIds?: Set<string>;
};

export function getScriptHealth(
  script: DemoScript,
  options: ScriptHealthOptions = {},
): ScriptHealth {
  const nodes = options.nodes ?? script.nodes;
  const backgroundAssetIds =
    options.backgroundAssetIds ??
    new Set(
      script.assets
        .filter(
          (asset) => asset.type === "background" && asset.status === "approved",
        )
        .map((asset) => asset.id),
    );
  const characterAssetIds =
    options.characterAssetIds ??
    new Set(
      script.assets
        .filter((asset) =>
          ["character", "expression", "pose"].includes(asset.type),
        )
        .filter((asset) => asset.status === "approved")
        .map((asset) => asset.id),
    );
  const characterIds =
    options.characterIds ??
    new Set(script.characters.map((character) => character.id));
  const startNodes = nodes.filter((node) => node.nodeType === "start");
  const roots = startNodes.length > 0 ? startNodes : nodes.slice(0, 1);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const reachable = new Set<string>();
  const queue = roots.map((node) => node.id);

  while (queue.length > 0) {
    const nodeId = queue.shift();

    if (!nodeId || reachable.has(nodeId)) {
      continue;
    }

    reachable.add(nodeId);
    const node = byId.get(nodeId);

    if (node) {
      queue.push(
        ...node.choices
          .map((choice) => choice.nextNodeId)
          .filter((targetId) => targetId && byId.has(targetId)),
      );
    }
  }

  const nodeReports = nodes.map((node) => {
    const presentation = getNodePresentation(node, script);
    const report = getNodeHealth({
      node,
      nodes,
      presentation,
      backgroundAssetIds,
      characterAssetIds,
      characterIds,
    });

    return { node, presentation, report };
  });

  const blockingNodes = nodeReports.filter(({ report }) =>
    report.issues.some((issue) => issue.severity === "error"),
  ).length;
  const warningNodes = nodeReports.filter(
    ({ report }) =>
      !report.issues.some((issue) => issue.severity === "error") &&
      report.issues.some((issue) => issue.severity === "warning"),
  ).length;
  const unreachableNodes = nodes.filter(
    (node) => node.nodeType !== "start" && !reachable.has(node.id),
  ).length;
  const deadEndNodes = nodes.filter(
    (node) => node.nodeType !== "ending" && node.choices.length === 0,
  ).length;
  const missingSceneBackgrounds = nodeReports.filter(
    ({ node, presentation }) =>
      presentation === "scene" &&
      (!node.backgroundAssetId || !backgroundAssetIds.has(node.backgroundAssetId)),
  ).length;
  const missingCharacterArt = nodeReports.filter(
    ({ node, presentation }) =>
      presentation === "scene" &&
      (node.characterBindings.length === 0 ||
        node.characterBindings.some(
          (binding) =>
            !binding.assetId || !characterAssetIds.has(binding.assetId),
        )),
  ).length;
  const averageScore =
    nodeReports.length > 0
      ? Math.round(
          nodeReports.reduce((sum, item) => sum + item.report.score, 0) /
            nodeReports.length,
        )
      : 0;
  const globalPenalty =
    (startNodes.length === 0 ? 18 : 0) +
    Math.min(20, unreachableNodes * 5) +
    Math.min(18, deadEndNodes * 4);
  const score = Math.max(0, averageScore - globalPenalty);
  const highlights: HealthIssue[] = [];

  if (nodes.length === 0) {
    highlights.push({
      severity: "error",
      title: "没有剧情节点",
      detail: "至少需要一个开始节点，玩家才有入口。",
    });
  }

  if (startNodes.length === 0) {
    highlights.push({
      severity: "error",
      title: "缺少开始节点",
      detail: "请把入口节点类型设为 start，或从 DAG 骨架重新生成。",
    });
  }

  if (blockingNodes > 0) {
    highlights.push({
      severity: "error",
      title: `${blockingNodes} 个节点有阻塞项`,
      detail: "优先处理失效资源、空正文或选项目标问题。",
    });
  }

  if (unreachableNodes > 0) {
    highlights.push({
      severity: "warning",
      title: `${unreachableNodes} 个节点没有入口`,
      detail: "这些节点不会被正常进入，除非它们是暂存草稿。",
    });
  }

  if (deadEndNodes > 0) {
    highlights.push({
      severity: "warning",
      title: `${deadEndNodes} 个非结局节点没有后续`,
      detail: "建议添加选项或把它们标记为 ending。",
    });
  }

  if (missingSceneBackgrounds > 0 || missingCharacterArt > 0) {
    highlights.push({
      severity: "warning",
      title: "存在美术缺口",
      detail: `缺场景图 ${missingSceneBackgrounds} 处，缺立绘 ${missingCharacterArt} 处。`,
    });
  }

  return {
    score,
    totalNodes: nodes.length,
    blockingNodes,
    warningNodes,
    unreachableNodes,
    deadEndNodes,
    missingSceneBackgrounds,
    missingCharacterArt,
    highlights,
  };
}
