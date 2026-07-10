import Image from "next/image";
import Link from "next/link";
import { Plus, Workflow } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteScriptButton } from "@/components/admin/delete-script-button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getPresentationShortLabel,
  getScriptDefaultPresentation,
} from "@/lib/presentation";
import { readScripts } from "@/lib/script-store";

export default async function AdminScriptsPage() {
  const scripts = await readScripts();

  return (
    <AdminShell
      title="剧本生产台"
      description="管理内部剧本项目。这里用于策划主题、生产角色和美术资产、编辑剧情节点、测试并发布到用户端。"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {["全部", "草稿", "编辑中", "测试中", "审核中", "已发布"].map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {item}
            </button>
          ))}
        </div>
        <Link
          href="/admin/scripts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus size={16} />
          创建剧本
        </Link>
      </div>

      <div className="grid gap-4">
        {scripts.map((script) => {
          const cover = script.assets.find((asset) => asset.type === "cover");
          const endingCount = script.nodes.filter(
            (node) => node.nodeType === "ending",
          ).length;
          const presentation = getScriptDefaultPresentation(script);

          return (
            <article
              key={script.id}
              className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-md md:grid-cols-[120px_1fr_auto]"
            >
              <Link
                href={`/admin/scripts/${script.slug}`}
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100"
              >
                {cover ? (
                  <Image
                    src={cover.fileUrl}
                    alt={cover.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    未绑定封面
                  </div>
                )}
              </Link>
              <Link href={`/admin/scripts/${script.slug}`} className="block">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusPill status={script.status} />
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                    {getPresentationShortLabel(presentation)}
                  </span>
                  <span className="text-xs text-zinc-500">{script.theme}</span>
                  {script.accessPassword ? (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
                      已设置体验密码
                    </span>
                  ) : null}
                </div>
                <h2 className="text-xl font-semibold">{script.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                  {script.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
                  <span>{script.characters.length} 个角色</span>
                  <span>{script.assets.length} 个资源</span>
                  <span>{script.nodes.length} 个节点</span>
                  <span>{endingCount} 个结局</span>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:justify-center">
                <Link
                  href={`/admin/scripts/${script.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
                >
                  <Workflow size={17} />
                  继续生产
                </Link>
                <DeleteScriptButton slug={script.slug} title={script.title} />
              </div>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
