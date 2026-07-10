import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { HealthIssue, ScriptHealth } from "@/lib/script-health";

export function ScriptHealthPanel({ health }: { health: ScriptHealth }) {
  const ready = health.blockingNodes === 0 && health.unreachableNodes === 0;

  return (
    <section className="mb-4 rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-950">剧本级体检</div>
          <div className="mt-1 text-xs leading-5 text-zinc-500">
            {ready
              ? "主链路没有明显阻塞，可以继续打磨内容和美术。"
              : "先处理阻塞节点和不可达节点，作品会更稳定。"}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <HealthMetric label="总分" value={`${health.score}`} />
          <HealthMetric label="节点" value={`${health.totalNodes}`} />
          <HealthMetric label="阻塞" value={`${health.blockingNodes}`} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <CompactMetric label="建议补" value={health.warningNodes} />
        <CompactMetric label="无入口" value={health.unreachableNodes} />
        <CompactMetric label="死路" value={health.deadEndNodes} />
        <CompactMetric
          label="缺美术"
          value={health.missingSceneBackgrounds + health.missingCharacterArt}
        />
      </div>

      {health.highlights.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {health.highlights.slice(0, 4).map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs leading-5"
            >
              <div
                className={
                  item.severity === "error"
                    ? "font-medium text-rose-700"
                    : "font-medium text-amber-700"
                }
              >
                {item.title}
              </div>
              <div className="text-zinc-600">{item.detail}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function NodeHealthPanel({
  score,
  issues,
}: {
  score: number;
  issues: HealthIssue[];
}) {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;
  const isReady = errorCount === 0;
  const toneClass = isReady
    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
    : "border-amber-200 bg-amber-50 text-amber-950";
  const Icon = isReady ? CheckCircle2 : AlertTriangle;

  return (
    <section className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/75">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">稳定产出检查</div>
            <div className="mt-1 text-sm">
              {isReady
                ? "当前节点没有阻塞项，可以继续补内容或测试。"
                : "当前节点还有会影响播放或分支稳定的问题。"}
            </div>
          </div>
        </div>
        <div className="grid min-w-[140px] grid-cols-3 gap-2 text-center text-xs">
          <HealthMetric label="分数" value={`${score}`} />
          <HealthMetric label="必须修" value={`${errorCount}`} />
          <HealthMetric label="建议补" value={`${warningCount}`} />
        </div>
      </div>

      {issues.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {issues.slice(0, 6).map((issue, index) => (
            <div
              key={`${issue.title}-${index}`}
              className="rounded-lg border border-white/60 bg-white/70 p-3 text-sm"
            >
              <div className="flex items-center gap-2 font-medium">
                <span
                  className={
                    issue.severity === "error"
                      ? "text-rose-700"
                      : "text-amber-700"
                  }
                >
                  {issue.severity === "error" ? "必须修" : "建议补"}
                </span>
                <span className="text-zinc-950">{issue.title}</span>
              </div>
              <div className="mt-1 leading-5 text-zinc-600">{issue.detail}</div>
            </div>
          ))}
          {issues.length > 6 ? (
            <div className="text-xs text-zinc-600">
              还有 {issues.length - 6} 个问题，处理上面的阻塞项后再继续检查。
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function HealthMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/75 px-2 py-2">
      <div className="font-semibold text-zinc-950">{value}</div>
      <div className="mt-0.5 text-zinc-500">{label}</div>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: number }) {
  const toneClass =
    value > 0
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-emerald-200 bg-emerald-50 text-emerald-950";

  return (
    <div className={`rounded-lg border px-2 py-2 ${toneClass}`}>
      <div className="font-semibold">{value}</div>
      <div className="mt-0.5 text-zinc-500">{label}</div>
    </div>
  );
}
