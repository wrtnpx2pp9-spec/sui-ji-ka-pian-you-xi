"use client";

import {
  FolderPlus,
  ImagePlus,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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

export function AssetFolderTools({
  slug,
  folderPath,
  publicPath,
  characters,
  apiBasePath = "/api/admin/scripts",
}: {
  slug: string;
  folderPath: string;
  publicPath: string;
  characters: DemoCharacter[];
  apiBasePath?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<AssetType>("background");
  const [characterId, setCharacterId] = useState("");
  const [emotion, setEmotion] = useState("");
  const [pose, setPose] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function createFolder() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBasePath}/${slug}/assets/folder`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("创建素材文件夹失败");
      }

      setMessage("素材文件夹已创建，可以把图片放进对应分类目录。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建素材文件夹失败");
    } finally {
      setBusy(false);
    }
  }

  async function syncFolder() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBasePath}/${slug}/assets/import`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("同步素材文件夹失败");
      }

      const result = (await response.json()) as {
        imported: Array<{ id: string }>;
      };
      router.refresh();
      setMessage(`已同步 ${result.imported.length} 个新素材。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "同步素材文件夹失败");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) {
      setMessage("请拖入图片文件。");
      return;
    }

    const formData = new FormData();
    formData.set("type", type);
    formData.set("characterId", characterId);
    formData.set("emotion", emotion);
    formData.set("pose", pose);

    for (const file of files) {
      formData.append("files", file);
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBasePath}/${slug}/assets/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传素材失败");
      }

      const result = (await response.json()) as {
        uploaded: Array<{ id: string }>;
      };
      router.refresh();
      setMessage(`已上传并登记 ${result.uploaded.length} 个素材。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传素材失败");
    } finally {
      setBusy(false);
      setDragging(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="mb-5 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <FolderPlus size={20} className="text-teal-700" />
            剧本素材文件夹
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            每个剧本有自己的素材目录。把图片放进去，或直接拖到下面的上传区，节点编辑页就能选到。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={createFolder}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
          >
            <FolderPlus size={16} />
            创建文件夹
          </button>
          <button
            type="button"
            onClick={syncFolder}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <RefreshCw size={16} />
            同步文件夹
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg bg-zinc-50 p-3 text-sm">
        <div>
          <span className="text-zinc-500">本地目录：</span>
          <span className="break-all font-mono text-xs text-zinc-800">
            {folderPath}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">访问路径：</span>
          <span className="break-all font-mono text-xs text-zinc-800">
            {publicPath}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_1fr]">
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          素材类型
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
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          绑定角色
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
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          情绪
          <input
            value={emotion}
            onChange={(event) => setEmotion(event.target.value)}
            className="input"
            placeholder="calm / worried / night"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          姿态
          <input
            value={pose}
            onChange={(event) => setPose(event.target.value)}
            className="input"
            placeholder="standing / phone / wide"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          uploadFiles(event.dataTransfer.files);
        }}
        disabled={busy}
        className={`grid min-h-40 place-items-center rounded-lg border border-dashed p-6 text-center transition ${
          dragging
            ? "border-teal-400 bg-teal-50 text-teal-900"
            : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
        } disabled:opacity-60`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              uploadFiles(event.target.files);
            }
          }}
        />
        <span className="grid justify-items-center gap-2">
          <UploadCloud size={28} />
          <span className="font-medium">拖拽图片到这里，或点击选择文件</span>
          <span className="text-xs text-zinc-500">
            上传后会保存到当前剧本素材文件夹，并自动登记为可用素材。
          </span>
        </span>
      </button>

      {message ? (
        <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
          <ImagePlus size={16} />
          {message}
        </div>
      ) : null}
    </section>
  );
}
