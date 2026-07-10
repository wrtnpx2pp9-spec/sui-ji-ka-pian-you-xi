"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { DemoCharacter, DemoScript } from "@/lib/types";

export function CharacterAiSettings({
  script,
}: {
  script: Pick<DemoScript, "slug" | "characters">;
}) {
  const [characters, setCharacters] = useState(script.characters);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateCharacter(
    characterId: string,
    patch: Partial<DemoCharacter["aiProfile"]>,
  ) {
    setCharacters((current) =>
      current.map((character) =>
        character.id === characterId
          ? {
              ...character,
              aiProfile: {
                ...character.aiProfile,
                ...patch,
              },
            }
          : character,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/scripts/${script.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characters }),
      });

      if (!response.ok) {
        throw new Error("保存角色 AI 设置失败");
      }

      setMessage("角色 AI 设置已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">角色 AI 人设</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            这里控制自由聊天时角色怎么回。DAG 仍然控制剧情走向，模型只负责当前节点内的一句话回复。
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "保存中" : "保存"}
        </button>
      </div>

      <div className="grid gap-4">
        {characters.map((character) => (
          <div
            key={character.id}
            className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
          >
            <div>
              <div className="text-sm font-semibold text-zinc-950">
                {character.name}
              </div>
              <div className="text-xs text-zinc-500">{character.roleType}</div>
            </div>
            <label className="grid gap-2 text-sm font-medium text-zinc-800">
              模型人设 Prompt
              <textarea
                value={character.aiProfile?.systemPrompt ?? ""}
                onChange={(event) =>
                  updateCharacter(character.id, {
                    systemPrompt: event.target.value,
                  })
                }
                rows={4}
                className="input bg-white"
                placeholder="不填则自动使用角色描述、性格、剧情功能和当前节点状态。"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <label className="grid gap-2 text-sm font-medium text-zinc-800">
                回复风格补充
                <input
                  value={character.aiProfile?.replyStyle ?? ""}
                  onChange={(event) =>
                    updateCharacter(character.id, {
                      replyStyle: event.target.value,
                    })
                  }
                  className="input bg-white"
                  placeholder="比如：克制、暧昧、回避细节、强势"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-800">
                随机度
                <input
                  value={character.aiProfile?.temperature ?? 0.85}
                  onChange={(event) =>
                    updateCharacter(character.id, {
                      temperature: Number(event.target.value),
                    })
                  }
                  type="number"
                  min={0}
                  max={1.5}
                  step={0.05}
                  className="input bg-white"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {message ? (
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
          {message}
        </div>
      ) : null}
    </section>
  );
}
