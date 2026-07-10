"use client";

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
import { Link2, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import {
  addChoiceToExistingTarget,
  addDownstreamNode,
  createsCycle,
  deleteDagChoice,
  removeDagNode,
  updateDagChoice,
  updateDagNode,
  type DagDraftNode,
} from "@/lib/dag-draft";
import type { DemoNode } from "@/lib/types";

type FlowNodeData = {
  label: string;
  chapter: string;
  nodeType: DemoNode["nodeType"];
  choiceCount: number;
};

const nodeTypes = {
  story: FlowNode,
};

export function DagDraftEditor({
  nodes,
  selectedId,
  onNodesChange,
  onSelectedIdChange,
  onMessage,
}: {
  nodes: DagDraftNode[];
  selectedId: string;
  onNodesChange: (nodes: DagDraftNode[]) => void;
  onSelectedIdChange: (nodeId: string) => void;
  onMessage: (message: string) => void;
}) {
  const selectedNode =
    nodes.find((node) => node.id === selectedId) ?? nodes[0];

  const flowNodes = useMemo<Node<FlowNodeData>[]>(
    () =>
      nodes.map((node, index) => ({
        id: node.id,
        type: "story",
        position: {
          x: (index % 3) * 300,
          y: Math.floor(index / 3) * 180,
        },
        data: {
          label: node.title,
          chapter: node.chapter,
          nodeType: node.nodeType,
          choiceCount: node.choices.length,
        },
      })),
    [nodes],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      nodes.flatMap((node) =>
        node.choices.map((choice) => ({
          id: `${node.id}-${choice.id}-${choice.targetId}`,
          source: node.id,
          target: choice.targetId,
          label: choice.text,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          labelStyle: { fill: "#334155", fontSize: 12 },
          style: { stroke: "#0f766e" },
        })),
      ),
    [nodes],
  );

  function updateSelectedNode(patch: Partial<DagDraftNode>) {
    onNodesChange(updateDagNode(nodes, selectedNode.id, patch));
  }

  function addIsolatedNode() {
    const result = addDownstreamNode(nodes, selectedNode.id);
    const created = result.nodes.find((node) => node.id === result.selectedId);

    if (!created) {
      return;
    }

    const withoutAutoLink = result.nodes.map((node) =>
      node.id === selectedNode.id
        ? {
            ...node,
            choices: node.choices.filter(
              (choice) => choice.targetId !== result.selectedId,
            ),
          }
        : node,
    );

    onNodesChange(withoutAutoLink);
    onSelectedIdChange(created.id);
    onMessage("已添加孤立节点。需要跳转时，请从上游节点添加走向。");
  }

  function addConnectedNode() {
    const result = addDownstreamNode(nodes, selectedNode.id);
    onNodesChange(result.nodes);
    onSelectedIdChange(result.selectedId);
    onMessage("已创建下游节点，并自动从当前节点连过去。");
  }

  function addChoice() {
    const target =
      nodes.find(
        (node) =>
          node.id !== selectedNode.id &&
          !createsCycle(nodes, selectedNode.id, node.id),
      )?.id ?? "";

    if (!target) {
      onMessage("没有可安全连接的已有节点。请用“添加下游节点”创建新的跳转目标。");
      return;
    }

    const result = addChoiceToExistingTarget(nodes, selectedNode.id, target);

    if (result.error) {
      onMessage(result.error);
      return;
    }

    onNodesChange(result.nodes);
  }

  function deleteNode() {
    if (selectedNode.nodeType === "start") {
      onMessage("开场节点不能删除。");
      return;
    }

    const remaining = removeDagNode(nodes, selectedNode.id);
    onNodesChange(remaining);
    onSelectedIdChange(remaining[0]?.id ?? "");
  }

  function updateChoice(choiceId: string, patch: Parameters<typeof updateDagChoice>[3]) {
    const result = updateDagChoice(nodes, selectedNode.id, choiceId, patch);

    if (result.error) {
      onMessage(result.error);
      return;
    }

    onNodesChange(result.nodes);
  }

  function deleteChoice(choiceId: string) {
    onNodesChange(deleteDagChoice(nodes, selectedNode.id, choiceId));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(620px,1fr)_380px]">
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">DAG 剧情模板</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              最稳的做法：选中一个节点，点“添加下游节点”，系统会同时创建节点和跳转线。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addConnectedNode}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} />
              添加下游节点
            </button>
            <button
              type="button"
              onClick={addIsolatedNode}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              <Plus size={16} />
              添加孤立节点
            </button>
            <button
              type="button"
              onClick={addChoice}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              <Link2 size={16} />
              连到已有节点
            </button>
          </div>
        </div>

        <div className="h-[680px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            onNodeClick={(_, node) => onSelectedIdChange(node.id)}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </section>

      <aside className="grid gap-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">当前节点</h2>
            <button
              type="button"
              onClick={deleteNode}
              disabled={selectedNode.nodeType === "start"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 disabled:opacity-40"
              title="删除节点"
              aria-label="删除节点"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid gap-3">
            <Field label="标题">
              <input
                value={selectedNode.title}
                onChange={(event) =>
                  updateSelectedNode({ title: event.target.value })
                }
                className="input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="章节">
                <input
                  value={selectedNode.chapter}
                  onChange={(event) =>
                    updateSelectedNode({ chapter: event.target.value })
                  }
                  className="input"
                />
              </Field>
              <Field label="类型">
                <select
                  value={selectedNode.nodeType}
                  onChange={(event) =>
                    updateSelectedNode({
                      nodeType: event.target.value as DemoNode["nodeType"],
                    })
                  }
                  className="input"
                  disabled={selectedNode.id === "opening"}
                >
                  <option value="start">start</option>
                  <option value="normal">normal</option>
                  <option value="event">event</option>
                  <option value="choice">choice</option>
                  <option value="ending">ending</option>
                </select>
              </Field>
            </div>
            <Field label="这个节点发生什么">
              <textarea
                value={selectedNode.summary}
                onChange={(event) =>
                  updateSelectedNode({ summary: event.target.value })
                }
                rows={3}
                className="input"
              />
            </Field>
            <Field label="这个节点要把剧情推向哪里">
              <textarea
                value={selectedNode.goal}
                onChange={(event) =>
                  updateSelectedNode({ goal: event.target.value })
                }
                rows={3}
                className="input"
              />
            </Field>
            <Field label="节奏和味道">
              <input
                value={selectedNode.tone}
                onChange={(event) =>
                  updateSelectedNode({ tone: event.target.value })
                }
                className="input"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">走向</h2>
            <button
              type="button"
              onClick={addChoice}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium"
            >
              <Link2 size={16} />
              添加
            </button>
          </div>
          <div className="grid gap-3">
            {selectedNode.choices.length === 0 ? (
              <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">
                这个节点还没有走向。优先使用“添加下游节点”创建稳定跳转。
              </div>
            ) : null}
            {selectedNode.choices.map((choice) => (
              <div key={choice.id} className="grid gap-2 rounded-lg bg-zinc-50 p-3">
                <input
                  value={choice.text}
                  onChange={(event) =>
                    updateChoice(choice.id, { text: event.target.value })
                  }
                  className="input"
                />
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <select
                    value={choice.targetId}
                    onChange={(event) =>
                      updateChoice(choice.id, { targetId: event.target.value })
                    }
                    className="input"
                  >
                    {nodes
                      .filter((node) => node.id !== selectedNode.id)
                      .map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.title}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteChoice(choice.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700"
                    aria-label="删除走向"
                    title="删除走向"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
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
    <div className="w-60 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full border px-2 py-1 text-[11px] ${toneClass}`}>
          {data.nodeType}
        </span>
        <span className="text-[11px] text-zinc-500">{data.choiceCount} 走向</span>
      </div>
      <div className="mt-2 line-clamp-2 text-sm font-semibold">{data.label}</div>
      <div className="mt-2 truncate text-xs text-zinc-500">{data.chapter}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      {label}
      {children}
    </label>
  );
}
