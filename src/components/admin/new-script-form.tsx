"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { DagDraftEditor } from "@/components/admin/dag-draft-editor";
import {
  createOpeningDagNode,
  toApiNodeDrafts,
  validateDagDraft,
  type DagDraftNode,
} from "@/lib/dag-draft";

export function NewScriptForm({
  apiBasePath = "/api/admin/scripts",
  redirectBasePath = "/admin/scripts",
}: {
  apiBasePath?: string;
  redirectBasePath?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("未命名 DAG 剧本");
  const [description, setDescription] = useState("从开场节点开始搭建你的分支剧情。");
  const [theme, setTheme] = useState("待定主题");
  const [style, setStyle] = useState("由作者控制节奏和走向");
  const [nodes, setNodes] = useState<DagDraftNode[]>([createOpeningDagNode()]);
  const [selectedId, setSelectedId] = useState("opening");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateDagDraft(nodes);

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(apiBasePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "未命名 DAG 剧本",
          description: description.trim() || "从 DAG 开场节点开始创作。",
          theme: theme.trim() || "待定主题",
          style,
          defaultPresentation: "scene",
          nodeDrafts: toApiNodeDrafts(nodes),
        }),
      });

      if (!response.ok) {
        throw new Error("创建 DAG 剧本失败。");
      }

      const script = (await response.json()) as { slug: string };
      router.push(`${redirectBasePath}/${script.slug}/nodes`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-[1fr_1fr_1fr_1fr]">
        <Field label="剧本名">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="input"
          />
        </Field>
        <Field label="主题">
          <input
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            className="input"
          />
        </Field>
        <Field label="一句话简介">
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="input"
          />
        </Field>
        <Field label="风格">
          <input
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            className="input"
          />
        </Field>
      </section>

      <DagDraftEditor
        nodes={nodes}
        selectedId={selectedId}
        onNodesChange={setNodes}
        onSelectedIdChange={setSelectedId}
        onMessage={setMessage}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {message ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {message}
          </div>
        ) : (
          <div className="text-sm text-zinc-500">
            推荐流程：选中节点 → 添加下游节点 → 修改走向文案 → 继续往下搭。
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "创建中" : "创建并进入 DAG"}
        </button>
      </div>
    </form>
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
