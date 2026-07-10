"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Bot,
  FileText,
  ImageIcon,
  Link2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ChoiceEditor } from "@/components/admin/node-choice-editor";
import {
  NodeHealthPanel,
  ScriptHealthPanel,
} from "@/components/admin/node-editor-health-panels";
import {
  Field,
  PreviewStat,
  Section,
} from "@/components/admin/node-editor-ui";
import { SceneArtStage } from "@/components/play/scene-art-stage";
import {
  chatDeliveryOptions,
  chatKindOptions,
  chatSideOptions,
  getChatConfig,
} from "@/lib/chat-presentation";
import {
  getNodePresentation,
  getPresentationShortLabel,
  presentationOptions,
} from "@/lib/presentation";
import {
  getNodeHealth,
  getScriptHealth,
  type HealthIssue,
} from "@/lib/script-health";
import type {
  CharacterBinding,
  DemoChoice,
  DemoNode,
  DemoScript,
  DialogueLine,
  NodePresentation,
  SceneDialoguePosition,
  SceneDialogueVariant,
} from "@/lib/types";
import { getStoryLines } from "@/lib/story-lines";

type FlowNodeData = {
  label: string;
  chapter: string;
  nodeType: DemoNode["nodeType"];
  presentation: NodePresentation;
  choiceCount: number;
};

const nodeTypes = {
  story: FlowNode,
};

const dagDraftExample = `开场 [start] | 第一章 | 主角收到一条不该出现的消息
开场 -> 回复消息: 私信试探 | 先截图保存: 保留证据
私信试探 | 第一章 | 对方继续靠近，试图把话题变成只属于两个人的秘密
私信试探 -> 顺着聊下去: 深入陷阱 | 反问信息来源: 对方露怯
保留证据 | 第一章 | 主角把异常信息交给可信的人一起看
保留证据 -> 找朋友商量: 外部视角
深入陷阱 [ending] | 坏结局 | 主角被进一步带进对方设计的节奏
对方露怯 [ending] | 好结局 | 对方的说法前后矛盾，主角抓住破绽
外部视角 [ending] | 好结局 | 朋友帮助主角把线索重新排列，风险浮出水面`;

export function NodeEditor({
  script,
  apiBasePath = "/api/admin/scripts",
  assetBasePath = "/admin/scripts",
  allowAiDraft = true,
}: {
  script: DemoScript;
  apiBasePath?: string;
  assetBasePath?: string;
  allowAiDraft?: boolean;
}) {
  const [nodes, setNodes] = useState(script.nodes);
  const [selectedId, setSelectedId] = useState(
    script.nodes.find((node) => node.nodeType === "start")?.id ??
      script.nodes[0]?.id ??
      "",
  );
  const [saving, setSaving] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [message, setMessage] = useState("");
  const [dagDraft, setDagDraft] = useState(dagDraftExample);
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? nodes[0],
    [nodes, selectedId],
  );
  const backgroundAssets = script.assets.filter(
    (asset) => asset.type === "background",
  );
  const imageAssets = script.assets.filter((asset) =>
    ["cover", "background", "character", "expression", "pose", "prop", "ui"].includes(
      asset.type,
    ),
  );
  const characterAssets = script.assets.filter((asset) =>
    ["character", "expression", "pose"].includes(asset.type),
  );
  const selectedBackground = backgroundAssets.find(
    (asset) => asset.id === selectedNode?.backgroundAssetId,
  );
  const selectedPresentation = selectedNode
    ? getNodePresentation(selectedNode, script)
    : script.defaultPresentation ?? "scene";
  const selectedChatConfig = selectedNode
    ? getChatConfig(selectedNode.title, selectedNode.chatConfig)
    : getChatConfig("");
  const previewLine = selectedNode ? getStoryLines(selectedNode)[0] : null;
  const selectedSceneConfig = selectedNode?.sceneConfig ?? {
    dialoguePosition: "bottom" as SceneDialoguePosition,
    dialogueVariant: "glass" as SceneDialogueVariant,
    dimBackground: true,
  };
  const backgroundAssetIds = new Set(backgroundAssets.map((asset) => asset.id));
  const characterAssetIds = new Set(characterAssets.map((asset) => asset.id));
  const characterIds = new Set(script.characters.map((character) => character.id));
  const nodeHealth = selectedNode
    ? getNodeHealth({
        node: selectedNode,
        nodes,
        presentation: selectedPresentation,
        backgroundAssetIds,
        characterAssetIds,
        characterIds,
      })
    : { score: 0, issues: [] as HealthIssue[] };
  const scriptHealth = getScriptHealth(script, {
    nodes,
    backgroundAssetIds,
    characterAssetIds,
    characterIds,
  });

  const flowNodes = useMemo<Node<FlowNodeData>[]>(
    () =>
      nodes.map((node, index) => ({
        id: node.id,
        type: "story",
        position: {
          x: (index % 3) * 290,
          y: Math.floor(index / 3) * 180,
        },
        data: {
          label: node.title,
          chapter: node.chapter,
          nodeType: node.nodeType,
          presentation: getNodePresentation(node, script),
          choiceCount: node.choices.length,
        },
      })),
    [nodes, script],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      nodes.flatMap((node) =>
        node.choices
          .filter((choice) => choice.nextNodeId)
          .map((choice) => ({
            id: `${node.id}-${choice.id}-${choice.nextNodeId}`,
            source: node.id,
            target: choice.nextNodeId,
            label: choice.text,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            labelStyle: { fill: "#334155", fontSize: 12 },
            style: { stroke: "#0f766e" },
          })),
      ),
    [nodes],
  );

  function updateNode(patch: Partial<DemoNode>) {
    if (!selectedNode) {
      return;
    }

    setNodes((items) =>
      items.map((node) =>
        node.id === selectedNode.id ? { ...node, ...patch } : node,
      ),
    );
  }

  function updateChatConfig(patch: NonNullable<DemoNode["chatConfig"]>) {
    if (!selectedNode) {
      return;
    }

    updateNode({
      chatConfig: {
        ...selectedNode.chatConfig,
        ...patch,
      },
    });
  }

  function updateSceneConfig(patch: NonNullable<DemoNode["sceneConfig"]>) {
    if (!selectedNode) {
      return;
    }

    updateNode({
      sceneConfig: {
        ...selectedNode.sceneConfig,
        ...patch,
      },
    });
  }

  function updateDialogue(index: number, patch: Partial<DialogueLine>) {
    if (!selectedNode) {
      return;
    }

    updateNode({
      dialogues: selectedNode.dialogues.map((line, itemIndex) =>
        itemIndex === index ? { ...line, ...patch } : line,
      ),
    });
  }

  function addDialogue() {
    if (!selectedNode) {
      return;
    }

    const defaultCharacter =
      selectedPresentation === "chat"
        ? script.characters.find((character) => character.roleType !== "protagonist")
        : script.characters[0];
    const speaker = defaultCharacter?.key ?? script.characters[0]?.key ?? "player";
    updateNode({
      dialogues: [
        ...selectedNode.dialogues,
        {
          speaker,
          emotion: "calm",
          text: selectedPresentation === "chat" ? "新的消息。" : "新的对白。",
          chatSide: selectedPresentation === "chat" ? "incoming" : undefined,
          chatKind: selectedPresentation === "chat" ? "text" : undefined,
          timestamp: selectedPresentation === "chat" ? "刚刚" : undefined,
          deliveryStatus:
            selectedPresentation === "chat" ? "hidden" : undefined,
        },
      ],
    });
  }

  function updateCharacterBinding(
    index: number,
    patch: Partial<CharacterBinding>,
  ) {
    if (!selectedNode) {
      return;
    }

    updateNode({
      characterBindings: selectedNode.characterBindings.map((binding, itemIndex) =>
        itemIndex === index ? { ...binding, ...patch } : binding,
      ),
    });
  }

  function addCharacterBinding() {
    if (!selectedNode || script.characters.length === 0) {
      return;
    }

    const character = script.characters[0];
    const asset =
      characterAssets.find((item) => item.characterId === character.id) ??
      characterAssets[0];

    updateNode({
      characterBindings: [
        ...selectedNode.characterBindings,
        {
          characterId: character.id,
          assetId: asset?.id ?? "",
          position: "center",
        },
      ],
    });
  }

  function deleteCharacterBinding(index: number) {
    if (!selectedNode) {
      return;
    }

    updateNode({
      characterBindings: selectedNode.characterBindings.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    });
  }

  function updateChoice(index: number, patch: Partial<DemoChoice>) {
    if (!selectedNode) {
      return;
    }

    updateNode({
      choices: selectedNode.choices.map((choice, itemIndex) =>
        itemIndex === index ? { ...choice, ...patch } : choice,
      ),
    });
  }

  function addChoice() {
    if (!selectedNode) {
      return;
    }

    const target =
      nodes.find((node) => node.id !== selectedNode.id)?.id ?? selectedNode.id;
    const choice: DemoChoice = {
      id: `choice-${Date.now()}`,
      text: "新的选择",
      description: "描述这个选择会带来的倾向和后果。",
      nextNodeId: target,
      statDelta: {},
    };

    updateNode({ choices: [...selectedNode.choices, choice] });
  }

  function deleteChoice(index: number) {
    if (!selectedNode) {
      return;
    }

    updateNode({
      choices: selectedNode.choices.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function parseDagDraft() {
    type DraftNode = {
      title: string;
      chapter: string;
      summary: string;
      goal: string;
      tone: string;
      nodeType?: DemoNode["nodeType"];
      presentation?: NodePresentation;
      choices: Array<{ text: string; targetTitle: string }>;
    };

    const parsedNodes: DraftNode[] = [];
    const nodeByTitle = new Map<string, DraftNode>();
    const defaultBackground = backgroundAssets[0]?.id ?? "";
    const firstCharacter = script.characters[0];
    const firstCharacterAsset = firstCharacter
      ? characterAssets.find((asset) => asset.characterId === firstCharacter.id)
      : undefined;

    function parseHeader(rawHeader: string) {
      const parts = rawHeader
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);
      const tagMatches = Array.from(parts[0]?.matchAll(/\[([^\]]+)\]/g) ?? []);
      const tags = tagMatches.map((match) => match[1].trim().toLowerCase());
      const title = (parts[0] ?? "")
        .replace(/\[[^\]]+\]/g, "")
        .trim();

      if (!title) {
        throw new Error("DAG 骨架里有一行缺少节点标题。");
      }

      const nodeType =
        tags.find((tag): tag is DemoNode["nodeType"] =>
          ["start", "normal", "event", "choice", "ending"].includes(tag),
        ) ?? undefined;
      const presentation: NodePresentation | undefined = tags.includes("chat")
        ? "chat"
        : tags.includes("scene")
          ? "scene"
          : undefined;

      return {
        title,
        chapter: parts[1] ?? "待定章节",
        summary: parts[2] ?? "写下这个节点里真正发生的事。",
        goal: parts[3] ?? parts[2] ?? "写下你希望这个节点把剧情推向哪里。",
        tone: parts[4] ?? script.planning.tone ?? "按你的故事气质填写",
        nodeType,
        presentation,
      };
    }

    function ensureNode(rawHeader: string) {
      const header = parseHeader(rawHeader);
      const current = nodeByTitle.get(header.title);

      if (current) {
        current.chapter = header.chapter;
        current.summary = header.summary;
        current.goal = header.goal;
        current.tone = header.tone;
        current.nodeType = header.nodeType ?? current.nodeType;
        current.presentation = header.presentation ?? current.presentation;
        return current;
      }

      const node: DraftNode = { ...header, choices: [] };
      nodeByTitle.set(header.title, node);
      parsedNodes.push(node);
      return node;
    }

    const lines = dagDraft
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    for (const line of lines) {
      const [sourceRaw, choicesRaw] = line.split("->").map((part) => part.trim());
      const source = ensureNode(sourceRaw);

      if (!choicesRaw) {
        continue;
      }

      const choices = choicesRaw
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);

      for (const choiceRaw of choices) {
        const [choiceTextRaw, targetRaw] = choiceRaw
          .split(":")
          .map((part) => part.trim());
        const targetHeader = parseHeader(targetRaw || choiceTextRaw);
        const targetTitle = targetHeader.title;

        if (!targetTitle) {
          continue;
        }

        ensureNode(targetRaw || choiceTextRaw);
        source.choices.push({
          text: targetRaw ? choiceTextRaw : `进入「${targetTitle}」`,
          targetTitle,
        });
      }
    }

    if (parsedNodes.length === 0) {
      throw new Error("先写至少一个 DAG 节点。");
    }

    const hasStart = parsedNodes.some((node) => node.nodeType === "start");
    const idByTitle = new Map(
      parsedNodes.map((node, index) => [node.title, `dag-node-${Date.now()}-${index}`]),
    );

    return parsedNodes.map((node, index): DemoNode => {
      const nodeId = idByTitle.get(node.title) ?? `dag-node-${Date.now()}-${index}`;
      const presentation = node.presentation ?? script.defaultPresentation ?? "scene";

      return {
        id: nodeId,
        key: index === 0 ? "start" : `dag_node_${index + 1}`,
        title: node.title,
        nodeType: node.nodeType ?? (!hasStart && index === 0 ? "start" : "normal"),
        chapter: node.chapter,
        summary: node.summary,
        goal: node.goal,
        tone: node.tone,
        presentation,
        chatConfig:
          presentation === "chat"
            ? {
                appName: "私信",
                contactName: node.title,
                contactStatus: "在线",
                showTyping: false,
              }
            : undefined,
        backgroundAssetId: defaultBackground,
        characterBindings:
          firstCharacter && firstCharacterAsset
            ? [
                {
                  characterId: firstCharacter.id,
                  assetId: firstCharacterAsset.id,
                  position: "left",
                },
              ]
            : [],
        statDelta: {},
        narration: node.summary,
        dialogues: [],
        choices: node.choices.map((choice, choiceIndex) => ({
          id: `${nodeId}-choice-${choiceIndex + 1}`,
          text: choice.text,
          description: `走向：${choice.targetTitle}`,
          nextNodeId: idByTitle.get(choice.targetTitle) ?? "",
          statDelta: {},
        })),
      };
    });
  }

  async function buildDagFromDraft() {
    const confirmed = window.confirm(
      "这会用骨架重新生成整张 DAG，并替换当前所有节点和连线。继续吗？",
    );

    if (!confirmed) {
      return;
    }

    setMutating(true);
    setMessage("");

    try {
      const nextNodes = parseDagDraft();
      const response = await fetch(`${apiBasePath}/${script.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: nextNodes }),
      });

      if (!response.ok) {
        throw new Error("保存 DAG 失败");
      }

      const nextScript = (await response.json()) as DemoScript;
      setNodes(nextScript.nodes);
      setSelectedId(
        nextScript.nodes.find((node) => node.nodeType === "start")?.id ??
          nextScript.nodes[0]?.id ??
          "",
      );
      setMessage("DAG 已从骨架生成，并自动补成可编辑场景节点。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成 DAG 失败");
    } finally {
      setMutating(false);
    }
  }

  async function saveNode(node = selectedNode) {
    if (!node) {
      return null;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${apiBasePath}/${script.slug}/nodes/${node.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(node),
        },
      );

      if (!response.ok) {
        throw new Error("节点保存失败");
      }

      const next = (await response.json()) as DemoNode;
      setNodes((items) =>
        items.map((item) => (item.id === next.id ? next : item)),
      );
      setMessage(`已保存节点：${next.title}`);
      return next;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "节点保存失败");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function addStoryAfterCurrent() {
    if (!selectedNode) {
      return;
    }

    setMutating(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBasePath}/${script.slug}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentNodeId: selectedNode.id }),
      });

      if (!response.ok) {
        throw new Error("添加后续剧情失败");
      }

      const result = (await response.json()) as {
        script: DemoScript;
        node: DemoNode;
      };

      setNodes(result.script.nodes);
      setSelectedId(result.node.id);
      setMessage("已从当前节点延展出一段新剧情，并自动创建连接选项。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "添加后续剧情失败");
    } finally {
      setMutating(false);
    }
  }

  async function deleteNode() {
    if (!selectedNode || selectedNode.nodeType === "start") {
      setMessage("开始节点不能删除。");
      return;
    }

    const confirmed = window.confirm(`确认删除节点“${selectedNode.title}”？`);
    if (!confirmed) {
      return;
    }

    setMutating(true);
    setMessage("");

    try {
      const response = await fetch(
        `${apiBasePath}/${script.slug}/nodes/${selectedNode.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("删除节点失败");
      }

      const remaining = nodes
        .filter((node) => node.id !== selectedNode.id)
        .map((node) => ({
          ...node,
          choices: node.choices.filter(
            (choice) => choice.nextNodeId !== selectedNode.id,
          ),
        }));

      setNodes(remaining);
      setSelectedId(
        remaining.find((node) => node.nodeType === "start")?.id ??
          remaining[0]?.id ??
          "",
      );
      setMessage("节点已删除，指向该节点的选项也已移除。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除节点失败");
    } finally {
      setMutating(false);
    }
  }

  async function generateDraft() {
    if (!selectedNode || !allowAiDraft) {
      return;
    }

    setMutating(true);
    setMessage("");

    try {
      const response = await fetch(
        `${apiBasePath}/${script.slug}/nodes/${selectedNode.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate_draft" }),
        },
      );

      if (!response.ok) {
        throw new Error("AI 补全失败");
      }

      const next = (await response.json()) as DemoNode;
      setNodes((items) =>
        items.map((node) => (node.id === next.id ? next : node)),
      );
      setMessage("AI 已沿着当前节点目标补全旁白和对白草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 补全失败");
    } finally {
      setMutating(false);
    }
  }

  if (!selectedNode) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        当前剧本还没有节点。
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(500px,0.95fr)_minmax(540px,1.05fr)]">
      <aside className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">DAG 剧情图</h2>
            <p className="mt-1 text-xs text-zinc-500">
              从开始节点出发，通过选择连接到后续剧情。
            </p>
          </div>
          <button
            type="button"
            onClick={addStoryAfterCurrent}
            disabled={mutating}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <Plus size={16} />
            添加后续剧情
          </button>
        </div>

        <ScriptHealthPanel health={scriptHealth} />

        <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                <FileText size={16} />
                DAG 骨架
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                一行写节点，一行写分支：节点 A -&gt; 选项文案: 节点 B | 另一个选项: 节点 C。
              </p>
            </div>
            <button
              type="button"
              onClick={buildDagFromDraft}
              disabled={mutating}
              className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900 disabled:opacity-60"
            >
              <Save size={16} />
              生成并保存 DAG
            </button>
          </div>
          <textarea
            value={dagDraft}
            onChange={(event) => setDagDraft(event.target.value)}
            rows={9}
            className="input font-mono text-xs leading-5"
          />
          <div className="mt-2 text-xs leading-5 text-zinc-500">
            可选标记：节点后写 [start]、[ending]、[chat] 或 [scene]。竖线后依次是章节、发生事件、作者意图、节奏。
          </div>
        </div>

        <div className="h-[640px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            onNodeClick={(_, node) => setSelectedId(node.id)}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-600">
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-teal-950">
            <div className="font-semibold">作者控制台</div>
            <div className="mt-1">
              先定节点作用和分支走向，再写旁白、对白和选项。AI
              只按你已经写下的设定补草稿，不负责决定剧情。
            </div>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            推荐工作流：选中节点 → 添加选项 → 添加后续剧情 → 保存节点 → AI 补全内容。
          </div>
          <div className="rounded-lg bg-teal-50 p-3 text-teal-900">
            AI 只补当前固定节点已有的旁白和对白，不自动新增未审核分支。
          </div>
        </div>
      </aside>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-teal-700">
              当前节点
            </p>
            <h2 className="mt-1 text-lg font-semibold">{selectedNode.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addChoice}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              <Link2 size={16} />
              添加选项
            </button>
            <button
              type="button"
              onClick={addStoryAfterCurrent}
              disabled={mutating}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
            >
              <Plus size={16} />
              添加剧情
            </button>
            {allowAiDraft ? (
              <button
                type="button"
                onClick={generateDraft}
                disabled={mutating}
                className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900 disabled:opacity-60"
              >
                <Bot size={16} />
                按设定补草稿
              </button>
            ) : null}
            <button
              type="button"
              onClick={deleteNode}
              disabled={mutating || selectedNode.nodeType === "start"}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 disabled:opacity-50"
            >
              <Trash2 size={16} />
              删除
            </button>
            <button
              type="button"
              onClick={() => saveNode()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "保存中" : "保存"}
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          <NodeHealthPanel score={nodeHealth.score} issues={nodeHealth.issues} />

          <Section title="节点设定">
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="标题">
                <input
                  value={selectedNode.title}
                  onChange={(event) => updateNode({ title: event.target.value })}
                  className="input"
                />
              </Field>
              <Field label="章节">
                <input
                  value={selectedNode.chapter}
                  onChange={(event) =>
                    updateNode({ chapter: event.target.value })
                  }
                  className="input"
                />
              </Field>
              <Field label="类型">
                <select
                  value={selectedNode.nodeType}
                  onChange={(event) =>
                    updateNode({
                      nodeType: event.target.value as DemoNode["nodeType"],
                    })
                  }
                  className="input"
                >
                  {["start", "normal", "event", "choice", "ending"].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="演出载体">
                <select
                  value={selectedPresentation}
                  onChange={(event) =>
                    updateNode({
                      presentation: event.target.value as NodePresentation,
                    })
                  }
                  className="input"
                >
                  {presentationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-600">
              {selectedPresentation === "chat"
                ? "聊天型节点会在用户端渲染为手机私信界面；对白就是聊天气泡，旁白适合作为系统提示或安全提醒。"
                : "场景型节点会在用户端渲染为背景图、角色立绘和剧情文本；美术贴图会直接参与画面演出。"}
            </div>

            <Field label="剧情目标">
              <textarea
                value={selectedNode.goal}
                onChange={(event) => updateNode({ goal: event.target.value })}
                rows={3}
                className="input"
              />
            </Field>
          </Section>

          <Section title="作者把控">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="本节点发生什么">
                <textarea
                  value={selectedNode.summary}
                  onChange={(event) =>
                    updateNode({ summary: event.target.value })
                  }
                  rows={4}
                  className="input"
                  placeholder="只写事实骨架：谁做了什么，局面发生了什么变化。"
                />
              </Field>
              <Field label="本节点要把剧情推向哪里">
                <textarea
                  value={selectedNode.goal}
                  onChange={(event) => updateNode({ goal: event.target.value })}
                  rows={4}
                  className="input"
                  placeholder="写作者意图：关系升温、矛盾暴露、误会加深、进入反击等。"
                />
              </Field>
            </div>
            <Field label="节奏和味道">
              <textarea
                value={selectedNode.tone}
                onChange={(event) => updateNode({ tone: event.target.value })}
                rows={3}
                className="input"
                placeholder="比如：压抑、暧昧、轻松、悬疑、克制、爆发前的安静。"
              />
            </Field>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
              这里是剧情方向盘。你先把这三块写清楚，再往下填正文、对白和选项；这样后续补草稿也会围着你的设计走。
            </div>
          </Section>

          {selectedPresentation === "scene" ? (
            <Section title="场景演出配置">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="对白框位置">
                  <select
                    value={selectedSceneConfig.dialoguePosition ?? "bottom"}
                    onChange={(event) =>
                      updateSceneConfig({
                        dialoguePosition: event.target
                          .value as SceneDialoguePosition,
                      })
                    }
                    className="input"
                  >
                    <option value="bottom">底部</option>
                    <option value="middle">中部</option>
                    <option value="top">顶部</option>
                  </select>
                </Field>
                <Field label="对白框样式">
                  <select
                    value={selectedSceneConfig.dialogueVariant ?? "glass"}
                    onChange={(event) =>
                      updateSceneConfig({
                        dialogueVariant: event.target
                          .value as SceneDialogueVariant,
                      })
                    }
                    className="input"
                  >
                    <option value="glass">半透明</option>
                    <option value="solid">实底</option>
                  </select>
                </Field>
                <label className="flex items-center gap-2 self-end rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm font-medium text-zinc-800">
                  <input
                    type="checkbox"
                    checked={selectedSceneConfig.dimBackground !== false}
                    onChange={(event) =>
                      updateSceneConfig({ dimBackground: event.target.checked })
                    }
                    className="size-4 rounded border-zinc-300"
                  />
                  压暗背景增强可读性
                </label>
              </div>
            </Section>
          ) : null}

          {selectedPresentation === "scene" && previewLine ? (
            <Section
              title="用户端场景预览"
              action={
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <ImageIcon size={14} />
                  跟随当前节点
                </span>
              }
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950">
                  <SceneArtStage
                    script={script}
                    node={selectedNode}
                    currentLine={previewLine}
                    backgroundUrl={selectedBackground?.fileUrl}
                    backgroundName={selectedBackground?.name}
                    showChoices
                    compact
                    className="min-h-[520px]"
                  />
                </div>
                <div className="grid content-start gap-3 text-sm leading-6 text-zinc-600">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <div className="font-medium text-zinc-950">预览取样</div>
                    <div className="mt-1">
                      这里展示当前节点的第一句旁白或对白，用户端会按点击进度逐句推进。
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    <PreviewStat
                      label="背景"
                      value={selectedBackground?.name ?? "默认场景贴图"}
                    />
                    <PreviewStat
                      label="立绘"
                      value={`${selectedNode.characterBindings.length} 个绑定`}
                    />
                    <PreviewStat
                      label="选项"
                      value={`${selectedNode.choices.length} 个走向`}
                    />
                  </div>
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-teal-950">
                    先在这里确认画面可读性：背景不能压过对白框，立绘不要挡住主体信息，选项文案要能一眼看懂。
                  </div>
                </div>
              </div>
            </Section>
          ) : null}

          {selectedPresentation === "chat" ? (
            <Section title="手机聊天配置">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="App / 会话类型">
                  <input
                    value={selectedChatConfig.appName}
                    onChange={(event) =>
                      updateChatConfig({ appName: event.target.value })
                    }
                    className="input"
                    placeholder="私信 / 微信 / 短信"
                  />
                </Field>
                <Field label="联系人 / 会话标题">
                  <input
                    value={selectedChatConfig.contactName}
                    onChange={(event) =>
                      updateChatConfig({ contactName: event.target.value })
                    }
                    className="input"
                  />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="联系人状态">
                  <input
                    value={selectedChatConfig.contactStatus}
                    onChange={(event) =>
                      updateChatConfig({ contactStatus: event.target.value })
                    }
                    className="input"
                    placeholder="在线 / 刚刚活跃 / 对方正在输入"
                  />
                </Field>
                <Field label="正在输入文案">
                  <input
                    value={selectedChatConfig.typingLabel}
                    onChange={(event) =>
                      updateChatConfig({ typingLabel: event.target.value })
                    }
                    className="input"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                <input
                  type="checkbox"
                  checked={selectedChatConfig.showTyping}
                  onChange={(event) =>
                    updateChatConfig({ showTyping: event.target.checked })
                  }
                  className="size-4 rounded border-zinc-300"
                />
                显示“正在输入”气泡
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                  <input
                    type="checkbox"
                    checked={selectedNode.chatConfig?.allowFreeReply !== false}
                    onChange={(event) =>
                      updateChatConfig({ allowFreeReply: event.target.checked })
                    }
                    className="size-4 rounded border-zinc-300"
                  />
                  允许玩家自由发消息
                </label>
                <Field label="模型回复角色">
                  <select
                    value={selectedNode.chatConfig?.responderCharacterId ?? ""}
                    onChange={(event) =>
                      updateChatConfig({
                        responderCharacterId: event.target.value || undefined,
                      })
                    }
                    className="input"
                  >
                    <option value="">自动选择非主角</option>
                    {script.characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="自由输入占位文案">
                <input
                  value={selectedNode.chatConfig?.freeReplyPlaceholder ?? ""}
                  onChange={(event) =>
                    updateChatConfig({
                      freeReplyPlaceholder: event.target.value || undefined,
                    })
                  }
                  className="input"
                  placeholder="输入一句你想说的话"
                />
              </Field>
              <Field label="安全提示条">
                <textarea
                  value={selectedChatConfig.safetyHint}
                  onChange={(event) =>
                    updateChatConfig({ safetyHint: event.target.value })
                  }
                  rows={3}
                  className="input"
                />
              </Field>
            </Section>
          ) : null}

          <Section
            title={selectedPresentation === "chat" ? "聊天辅助图" : "场景图"}
            action={
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                <ImageIcon size={14} />
                从剧本资源库选择
              </span>
            }
          >
            <Field label="背景资源">
              <select
                value={selectedNode.backgroundAssetId}
                onChange={(event) =>
                  updateNode({ backgroundAssetId: event.target.value })
                }
                className="input"
              >
                <option value="">不绑定场景图</option>
                {backgroundAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                {selectedBackground ? (
                  <Image
                    src={selectedBackground.fileUrl}
                    alt={selectedBackground.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
                    当前节点还没有匹配场景图
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                {selectedBackground ? (
                  <>
                    <div className="text-zinc-700">
                      已绑定{selectedPresentation === "chat" ? "辅助图" : "场景"}：
                      <span className="font-medium text-zinc-950">
                        {selectedBackground.name}
                      </span>
                    </div>
                    <div className="truncate text-zinc-600">
                      {selectedBackground.fileUrl}
                    </div>
                  </>
                ) : (
                  <>
                    需要先在{" "}
                    <Link
                      href={`${assetBasePath}/${script.slug}/assets`}
                      className="font-medium text-teal-800 underline"
                    >
                      美术资源页
                    </Link>{" "}
                    登记 type 为 background 的图片资源，然后回到这里绑定。
                  </>
                )}
              </div>
            </div>
          </Section>

          <Section
            title={selectedPresentation === "chat" ? "联系人头像 / 立绘" : "角色立绘"}
            action={
              <button
                type="button"
                onClick={addCharacterBinding}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50"
              >
                添加立绘
              </button>
            }
          >
            <div className="grid gap-3">
              {selectedNode.characterBindings.length === 0 ? (
                <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">
                  当前节点还没有角色立绘。先在{" "}
                  <Link
                    href={`${assetBasePath}/${script.slug}/assets`}
                    className="font-medium text-teal-800 underline"
                  >
                    美术资源页
                  </Link>{" "}
                  上传或同步 character / expression / pose 素材，再回到这里绑定。
                </div>
              ) : null}

              {selectedNode.characterBindings.map((binding, index) => {
                const assetsForCharacter = characterAssets.filter(
                  (asset) =>
                    !asset.characterId || asset.characterId === binding.characterId,
                );
                const selectedAsset = characterAssets.find(
                  (asset) => asset.id === binding.assetId,
                );

                return (
                  <div
                    key={`${binding.characterId}-${binding.assetId}-${index}`}
                    className="grid gap-3 rounded-lg bg-zinc-50 p-3 md:grid-cols-[160px_1fr_120px_auto]"
                  >
                    <select
                      value={binding.characterId}
                      onChange={(event) =>
                        updateCharacterBinding(index, {
                          characterId: event.target.value,
                          assetId: "",
                        })
                      }
                      className="input"
                    >
                      {script.characters.map((character) => (
                        <option key={character.id} value={character.id}>
                          {character.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={binding.assetId}
                      onChange={(event) =>
                        updateCharacterBinding(index, {
                          assetId: event.target.value,
                        })
                      }
                      className="input"
                    >
                      <option value="">不绑定立绘</option>
                      {assetsForCharacter.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={binding.position}
                      onChange={(event) =>
                        updateCharacterBinding(index, {
                          position: event.target
                            .value as CharacterBinding["position"],
                        })
                      }
                      className="input"
                    >
                      <option value="left">left</option>
                      <option value="center">center</option>
                      <option value="right">right</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteCharacterBinding(index)}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    >
                      删除
                    </button>
                    {selectedAsset ? (
                      <div className="grid gap-3 md:col-span-4 md:grid-cols-[120px_1fr]">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-zinc-200 bg-white">
                          <Image
                            src={selectedAsset.fileUrl}
                            alt={selectedAsset.name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="self-center truncate text-xs text-zinc-500">
                          {selectedAsset.fileUrl}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="旁白">
            <textarea
              value={selectedNode.narration}
              onChange={(event) => updateNode({ narration: event.target.value })}
              rows={5}
              className="input"
            />
          </Section>

          <Section
            title={selectedPresentation === "chat" ? "聊天消息" : "对白"}
            action={
              <button
                type="button"
                onClick={addDialogue}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50"
              >
                {selectedPresentation === "chat" ? "添加消息" : "添加对白"}
              </button>
            }
          >
            <div className="grid gap-3">
              {selectedNode.dialogues.length === 0 ? (
                <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">
                  当前节点还没有{selectedPresentation === "chat" ? "聊天消息" : "对白"}。
                </p>
              ) : null}

              {selectedNode.dialogues.map((line, index) =>
                selectedPresentation === "chat" ? (
                  <div
                    key={`${line.speaker}-${index}`}
                    className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                  >
                    <div className="grid gap-3 md:grid-cols-[140px_120px_120px_120px]">
                      <Field label="说话人">
                        <select
                          value={line.speaker}
                          onChange={(event) =>
                            updateDialogue(index, {
                              speaker: event.target.value,
                            })
                          }
                          className="input"
                        >
                          <option value="player">玩家</option>
                          {script.characters.map((character) => (
                            <option key={character.id} value={character.key}>
                              {character.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="方向">
                        <select
                          value={line.chatSide ?? "incoming"}
                          onChange={(event) =>
                            updateDialogue(index, {
                              chatSide: event.target
                                .value as DialogueLine["chatSide"],
                            })
                          }
                          className="input"
                        >
                          {chatSideOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="类型">
                        <select
                          value={line.chatKind ?? "text"}
                          onChange={(event) =>
                            updateDialogue(index, {
                              chatKind: event.target
                                .value as DialogueLine["chatKind"],
                            })
                          }
                          className="input"
                        >
                          {chatKindOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="状态">
                        <select
                          value={line.deliveryStatus ?? "hidden"}
                          onChange={(event) =>
                            updateDialogue(index, {
                              deliveryStatus: event.target
                                .value as DialogueLine["deliveryStatus"],
                            })
                          }
                          className="input"
                        >
                          {chatDeliveryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                      <Field label="时间">
                        <input
                          value={line.timestamp ?? ""}
                          onChange={(event) =>
                            updateDialogue(index, {
                              timestamp: event.target.value,
                            })
                          }
                          className="input"
                          placeholder="14:32 / 刚刚"
                        />
                      </Field>
                      <Field label="图片素材">
                        <select
                          value={line.assetId ?? ""}
                          onChange={(event) =>
                            updateDialogue(index, {
                              assetId: event.target.value || undefined,
                            })
                          }
                          className="input"
                          disabled={(line.chatKind ?? "text") !== "image"}
                        >
                          <option value="">不绑定图片</option>
                          {imageAssets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="消息内容">
                      <textarea
                        value={line.text}
                        onChange={(event) =>
                          updateDialogue(index, { text: event.target.value })
                        }
                        rows={3}
                        className="input"
                      />
                    </Field>
                  </div>
                ) : (
                  <div
                    key={`${line.speaker}-${index}`}
                    className="grid gap-2 md:grid-cols-[140px_120px_1fr]"
                  >
                    <select
                      value={line.speaker}
                      onChange={(event) =>
                        updateDialogue(index, { speaker: event.target.value })
                      }
                      className="input"
                    >
                      {script.characters.map((character) => (
                        <option key={character.id} value={character.key}>
                          {character.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={line.emotion}
                      onChange={(event) =>
                        updateDialogue(index, { emotion: event.target.value })
                      }
                      className="input"
                    />
                    <input
                      value={line.text}
                      onChange={(event) =>
                        updateDialogue(index, { text: event.target.value })
                      }
                      className="input"
                    />
                  </div>
                ),
              )}
            </div>
          </Section>

          <ChoiceEditor
            choices={selectedNode.choices}
            nodes={nodes}
            onUpdateChoice={updateChoice}
            onDeleteChoice={deleteChoice}
          />
        </div>

        {message ? (
          <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
            {message}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function FlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const toneClass =
    data.nodeType === "ending"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : data.nodeType === "choice"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : data.nodeType === "start"
          ? "border-teal-200 bg-teal-50 text-teal-800"
          : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <div className="w-60 rounded-xl bg-white p-3">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full border px-2 py-1 text-[11px] ${toneClass}`}>
          {data.nodeType}
        </span>
        <span className="text-[11px] text-zinc-500">
          {data.choiceCount} 个选项
        </span>
      </div>
      <div className="mt-2 line-clamp-2 text-sm font-semibold">{data.label}</div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-500">
        <span className="truncate">{data.chapter}</span>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5">
          {getPresentationShortLabel(data.presentation)}
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
