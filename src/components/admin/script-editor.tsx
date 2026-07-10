"use client";

import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getScriptDefaultPresentation,
  presentationOptions,
} from "@/lib/presentation";
import type { DemoScript, NodePresentation, ScriptStatus } from "@/lib/types";

const statusOptions: Array<{ value: ScriptStatus; label: string }> = [
  { value: "draft", label: "草稿" },
  { value: "ai_generating", label: "AI 生成中" },
  { value: "editing", label: "人工编辑" },
  { value: "testing", label: "测试中" },
  { value: "review", label: "审核中" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

export function ScriptEditor({
  initialScript,
  apiBasePath = "/api/admin/scripts",
  showStatusControl = true,
}: {
  initialScript: DemoScript;
  apiBasePath?: string;
  showStatusControl?: boolean;
}) {
  const [script, setScript] = useState<DemoScript>({
    ...initialScript,
    defaultPresentation: getScriptDefaultPresentation(initialScript),
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const tagText = useMemo(() => script.tags.join("，"), [script.tags]);

  async function save() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBasePath}/${script.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      const next = (await response.json()) as DemoScript;
      setScript(next);
      setMessage("已保存。用户端会读取最新发布内容。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">剧本配置</h2>
            <p className="mt-1 text-sm text-zinc-500">
              这里决定用户端看到的故事入口，以及生产团队后续围绕什么主题展开。
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "保存中" : "保存"}
          </button>
        </div>

        <div className="grid gap-4">
          <Field label="剧本名称">
            <input
              value={script.title}
              onChange={(event) =>
                setScript({ ...script, title: event.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="副标题">
            <input
              value={script.subtitle}
              onChange={(event) =>
                setScript({ ...script, subtitle: event.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="用户端简介">
            <textarea
              value={script.description}
              onChange={(event) =>
                setScript({ ...script, description: event.target.value })
              }
              rows={5}
              className="input"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="题材主题">
              <input
                value={script.theme}
                onChange={(event) =>
                  setScript({ ...script, theme: event.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="默认演出载体">
              <select
                value={script.defaultPresentation ?? "scene"}
                onChange={(event) =>
                  setScript({
                    ...script,
                    defaultPresentation: event.target.value as NodePresentation,
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
          <Field label="叙事风格">
            <input
              value={script.style}
              onChange={(event) =>
                setScript({ ...script, style: event.target.value })
              }
              className="input"
            />
          </Field>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-600">
            默认载体会影响后续新增节点；已存在节点仍可在节点编辑页单独切换。
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="标签">
              <input
                value={tagText}
                onChange={(event) =>
                  setScript({
                    ...script,
                    tags: event.target.value
                      .split(/[,，]/)
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                className="input"
              />
            </Field>
            {showStatusControl ? (
              <Field label="生产状态">
                <select
                  value={script.status}
                  onChange={(event) =>
                    setScript({
                      ...script,
                      status: event.target.value as ScriptStatus,
                    })
                  }
                  className="input"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="目标体验人群">
              <input
                value={script.targetAudience}
                onChange={(event) =>
                  setScript({ ...script, targetAudience: event.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="预计体验时长">
              <input
                value={script.estimatedMinutes}
                onChange={(event) =>
                  setScript({
                    ...script,
                    estimatedMinutes: Number(event.target.value),
                  })
                }
                type="number"
                min={3}
                className="input"
              />
            </Field>
          </div>
          <Field label="内容提示">
            <textarea
              value={script.contentWarning}
              onChange={(event) =>
                setScript({ ...script, contentWarning: event.target.value })
              }
              rows={3}
              className="input"
            />
          </Field>
          <Field label="剧本密码">
            <input
              value={script.accessPassword ?? ""}
              onChange={(event) =>
                setScript({ ...script, accessPassword: event.target.value })
              }
              type="password"
              className="input"
              placeholder="留空则不需要单独解锁"
            />
          </Field>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold">策划约束</h2>
          <p className="mt-1 text-sm text-zinc-500">
            这些内容不直接等于正文，但会约束角色、节点和 AI 生成方向。
          </p>
          <div className="mt-4 grid gap-3">
            <Field label="一句话设定">
              <textarea
                value={script.planning.logline}
                onChange={(event) =>
                  setScript({
                    ...script,
                    planning: {
                      ...script.planning,
                      logline: event.target.value,
                    },
                  })
                }
                rows={3}
                className="input"
              />
            </Field>
            <Field label="玩家目标">
              <textarea
                value={script.planning.playerGoal}
                onChange={(event) =>
                  setScript({
                    ...script,
                    planning: {
                      ...script.planning,
                      playerGoal: event.target.value,
                    },
                  })
                }
                rows={3}
                className="input"
              />
            </Field>
            <Field label="核心冲突">
              <textarea
                value={script.planning.mainConflict}
                onChange={(event) =>
                  setScript({
                    ...script,
                    planning: {
                      ...script.planning,
                      mainConflict: event.target.value,
                    },
                  })
                }
                rows={3}
                className="input"
              />
            </Field>
            <Field label="基调">
              <textarea
                value={script.planning.tone}
                onChange={(event) =>
                  setScript({
                    ...script,
                    planning: {
                      ...script.planning,
                      tone: event.target.value,
                    },
                  })
                }
                rows={2}
                className="input"
              />
            </Field>
            <Field label="安全边界">
              <textarea
                value={script.planning.safetyBoundary}
                onChange={(event) =>
                  setScript({
                    ...script,
                    planning: {
                      ...script.planning,
                      safetyBoundary: event.target.value,
                    },
                  })
                }
                rows={4}
                className="input"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
          <div className="font-semibold">保存状态</div>
          <div className="mt-1">{message || "本次修改尚未保存。"}</div>
        </section>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      {label}
      {children}
    </label>
  );
}
