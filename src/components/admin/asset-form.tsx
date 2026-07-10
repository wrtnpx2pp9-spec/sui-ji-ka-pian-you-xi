"use client";

import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssetType, DemoCharacter } from "@/lib/types";

const assetTypes: AssetType[] = [
  "background",
  "cover",
  "character",
  "expression",
  "pose",
  "prop",
  "ui",
];

export function AssetForm({
  slug,
  characters,
  apiBasePath = "/api/admin/scripts",
}: {
  slug: string;
  characters: DemoCharacter[];
  apiBasePath?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<AssetType>("background");
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [emotion, setEmotion] = useState("");
  const [pose, setPose] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBasePath}/${slug}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          key,
          name,
          fileUrl,
          characterId,
          emotion,
          pose,
        }),
      });

      if (!response.ok) {
        throw new Error("资源登记失败");
      }

      setKey("");
      setName("");
      setFileUrl("");
      setCharacterId("");
      setEmotion("");
      setPose("");
      router.refresh();
      setMessage("资源已登记，可以到节点编辑页绑定。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "资源登记失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-5 rounded-lg border border-zinc-200 bg-white p-5"
    >
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <ImagePlus size={20} className="text-teal-700" />
        登记美术资源
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="资源类型">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as AssetType)}
            className="input"
          >
            {assetTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="资源 key">
          <input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            className="input"
            placeholder="apartment-night"
            required
          />
        </Field>
        <Field label="显示名称">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input"
            placeholder="出租屋夜晚"
            required
          />
        </Field>
        <Field label="图片路径 / URL">
          <input
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            className="input"
            placeholder="/assets/demo/bg-apartment-night.svg"
            required
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field label="绑定角色">
          <select
            value={characterId}
            onChange={(event) => setCharacterId(event.target.value)}
            className="input"
          >
            <option value="">不绑定角色</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="情绪">
          <input
            value={emotion}
            onChange={(event) => setEmotion(event.target.value)}
            className="input"
            placeholder="calm / worried / night"
          />
        </Field>
        <Field label="姿态">
          <input
            value={pose}
            onChange={(event) => setPose(event.target.value)}
            className="input"
            placeholder="standing / phone / wide"
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "登记中" : "登记资源"}
        </button>
        {message ? <span className="text-sm text-zinc-600">{message}</span> : null}
      </div>
    </form>
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
