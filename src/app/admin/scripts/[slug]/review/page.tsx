import { notFound } from "next/navigation";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewDecisionForm } from "@/components/admin/review-decision-form";
import { StatusPill } from "@/components/ui/status-pill";
import { getScriptAssetRequirements } from "@/lib/asset-requirements";
import { getCreatorSession, canReview } from "@/lib/creator-auth";
import { getScriptHealth } from "@/lib/script-health";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getCreatorSession();

  if (!canReview(session)) {
    notFound();
  }

  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  const health = getScriptHealth(script);
  const requirements = getScriptAssetRequirements(script);
  const canPublish =
    health.blockingNodes === 0 &&
    health.unreachableNodes === 0 &&
    requirements.missing.length === 0;

  const checks = [
    ["存在开始节点", script.nodes.some((node) => node.nodeType === "start")],
    [
      "非结局节点均有出口",
      script.nodes
        .filter((node) => node.nodeType !== "ending")
        .every((node) => node.choices.length > 0),
    ],
    ["所有资源已审核", script.assets.every((asset) => asset.status === "approved")],
    ["至少一个结局", script.nodes.some((node) => node.nodeType === "ending")],
    ["安全边界已填写", script.planning.safetyBoundary.length > 0],
    ["结构体检通过", health.blockingNodes === 0],
  ] as const;

  return (
    <AdminShell
      title="审核发布"
      description="这里是管理员的最终闸口。通过后作品进入公开前台，驳回后会回到创作者继续编辑。"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{script.title}</h2>
                  <StatusPill status={script.status} />
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {script.theme} · {script.nodes.length} 节点 · {script.assets.length} 资源
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
                <div className="text-xs text-zinc-500">体检分数</div>
                <div className="text-2xl font-semibold">{health.score}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {checks.map(([label, passed]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
              >
                <span className="text-sm font-medium">{label}</span>
                {passed ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={18} />
                    通过
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm font-medium text-amber-700">
                    <CircleAlert size={18} />
                    待处理
                  </span>
                )}
              </div>
            ))}
          </div>

          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="text-base font-semibold">体检摘要</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Metric label="阻塞节点" value={`${health.blockingNodes}`} />
              <Metric label="警告节点" value={`${health.warningNodes}`} />
              <Metric label="不可达节点" value={`${health.unreachableNodes}`} />
              <Metric label="缺场景图" value={`${health.missingSceneBackgrounds}`} />
            </div>
            {health.highlights.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {health.highlights.map((item) => (
                  <div
                    key={`${item.title}-${item.detail}`}
                    className={`rounded-lg border p-3 text-sm ${
                      item.severity === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-900"
                        : "border-amber-200 bg-amber-50 text-amber-900"
                    }`}
                  >
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-1 leading-6">{item.detail}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="text-base font-semibold">美术缺口</h3>
            <div className="mt-3 grid gap-3">
              {requirements.missing.length > 0 ? (
                requirements.missing.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                  >
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-1 leading-6">{item.detail}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  当前没有明显的美术缺口。
                </div>
              )}
            </div>
          </section>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="text-base font-semibold">发布判定</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              发布需要没有阻塞项，并且关键资源可用。当前判定：
              <span
                className={`ml-1 font-medium ${
                  canPublish ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {canPublish ? "可发布" : "待补齐"}
              </span>
            </p>
          </section>

          <ReviewDecisionForm slug={script.slug} />

          <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-600">
            <div className="font-semibold text-zinc-950">审核说明</div>
            <p className="mt-2">
              通过后作品会进入公开前台。驳回后会保留审核意见，创作者可继续回到工作台编辑。
            </p>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
