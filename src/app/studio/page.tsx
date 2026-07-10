import Image from "next/image";
import Link from "next/link";
import { Plus, Workflow } from "lucide-react";
import { redirect } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import { StatusPill } from "@/components/ui/status-pill";
import { getScriptAssetRequirements } from "@/lib/asset-requirements";
import { getCreatorSession } from "@/lib/creator-auth";
import {
  getPresentationShortLabel,
  getScriptDefaultPresentation,
} from "@/lib/presentation";
import { getScriptHealth } from "@/lib/script-health";
import { readScripts } from "@/lib/script-store";

export default async function StudioPage() {
  const session = await getCreatorSession();

  if (!session) {
    redirect("/studio/login");
  }

  const scripts = (await readScripts()).filter(
    (script) => session.role === "admin" || script.ownerId === session.id,
  );

  return (
    <StudioShell
      title="我的剧本游戏"
      description="创建作品、上传美术、编辑分支剧情，完成后提交管理员审核发布。"
      session={session}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <Metric label="作品" value={scripts.length} />
          <Metric
            label="审核中"
            value={scripts.filter((script) => script.status === "review").length}
          />
          <Metric
            label="已发布"
            value={
              scripts.filter((script) => script.status === "published").length
            }
          />
        </div>
        <Link
          href="/studio/scripts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus size={16} />
          创建作品
        </Link>
      </div>

      <div className="grid gap-4">
        {scripts.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            还没有作品。先创建一个剧本，从开场节点开始搭建。
          </div>
        ) : null}

        {scripts.map((script) => {
          const cover = script.assets.find((asset) => asset.type === "cover");
          const presentation = getScriptDefaultPresentation(script);
          const health = getScriptHealth(script);
          const requirements = getScriptAssetRequirements(script);

          return (
            <article
              key={script.id}
              className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-md md:grid-cols-[120px_1fr_auto]"
            >
              <Link
                href={`/studio/scripts/${script.slug}`}
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
              <Link href={`/studio/scripts/${script.slug}`} className="block">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusPill status={script.status} />
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                    {getPresentationShortLabel(presentation)}
                  </span>
                  <span className="text-xs text-zinc-500">{script.theme}</span>
                  <span className="text-xs text-zinc-500">
                    体检 {health.score}
                  </span>
                  <span className="text-xs text-zinc-500">
                    缺口 {requirements.missing.length}
                  </span>
                </div>
                <h2 className="text-xl font-semibold">{script.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                  {script.description}
                </p>
                {script.reviewNotes ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                    审核意见：{script.reviewNotes}
                  </p>
                ) : null}
              </Link>
              <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:justify-center">
                <Link
                  href={`/studio/scripts/${script.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
                >
                  <Workflow size={17} />
                  继续制作
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </StudioShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <div className="font-semibold text-zinc-950">{value}</div>
      <div className="mt-0.5 text-xs text-zinc-500">{label}</div>
    </div>
  );
}
