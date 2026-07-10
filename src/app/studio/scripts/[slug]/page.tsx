import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Images,
  PlayCircle,
  Workflow,
} from "lucide-react";
import { ScriptEditor } from "@/components/admin/script-editor";
import { StatusPill } from "@/components/ui/status-pill";
import { StudioShell } from "@/components/studio/studio-shell";
import { SubmitReviewButton } from "@/components/studio/submit-review-button";
import {
  assertCanEditScript,
  getCreatorSession,
} from "@/lib/creator-auth";
import { getPresentationShortLabel, getScriptDefaultPresentation } from "@/lib/presentation";
import { getScriptHealth } from "@/lib/script-health";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function StudioScriptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getCreatorSession();

  if (!session) {
    redirect("/studio/login");
  }

  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  try {
    assertCanEditScript(session, script);
  } catch {
    notFound();
  }

  const presentation = getScriptDefaultPresentation(script);
  const health = getScriptHealth(script);

  return (
    <StudioShell
      title={script.title}
      description="这里编辑作品基础信息、查看发布状态，并跳转到节点和美术页面继续制作。"
      session={session}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={script.status} />
          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
            {getPresentationShortLabel(presentation)}
          </span>
          <span className="text-sm text-zinc-500">{script.theme}</span>
          {script.reviewNotes ? (
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-900">
              审核意见：{script.reviewNotes}
            </span>
          ) : null}
        </div>
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          <ArrowLeft size={16} />
          返回列表
        </Link>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <StatCard label="节点" value={script.nodes.length} />
        <StatCard label="资源" value={script.assets.length} />
        <StatCard label="角色" value={script.characters.length} />
        <StatCard label="体检分数" value={health.score} />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href={`/studio/scripts/${script.slug}/nodes`}
          className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
        >
          <Workflow size={16} />
          编写节点
        </Link>
        <Link
          href={`/studio/scripts/${script.slug}/assets`}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          <Images size={16} />
          美术资产
        </Link>
        <Link
          href={`/studio/scripts/${script.slug}/test`}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          <PlayCircle size={16} />
          预览测试
        </Link>
        <SubmitReviewButton slug={script.slug} disabled={script.status === "review"} />
      </div>

      <ScriptEditor
        initialScript={script}
        apiBasePath="/api/studio/scripts"
        showStatusControl={false}
      />
    </StudioShell>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
