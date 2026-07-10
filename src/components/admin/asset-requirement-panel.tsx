import { CheckCircle2, CircleAlert } from "lucide-react";
import type { ScriptAssetRequirements } from "@/lib/asset-requirements";

export function AssetRequirementPanel({
  requirements,
}: {
  requirements: ScriptAssetRequirements;
}) {
  return (
    <section className="mb-5 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">美术需求清单</h2>
          <p className="mt-1 text-sm text-zinc-500">
            系统会从封面、场景背景、角色默认立绘和对白情绪里统计缺口。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <Metric label="待补" value={requirements.missing.length} />
          <Metric label="已满足" value={requirements.satisfied.length} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
            <CircleAlert size={16} />
            需要补的资源
          </div>
          <div className="grid max-h-80 gap-2 overflow-auto pr-1">
            {requirements.missing.length > 0 ? (
              requirements.missing.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{item.title}</span>
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs">
                      {item.category}
                    </span>
                  </div>
                  <div className="mt-1 leading-6">{item.detail}</div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                暂无明显缺口，可以继续进入节点预览检查演出效果。
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={16} />
            已满足的资源
          </div>
          <div className="grid max-h-80 gap-2 overflow-auto pr-1">
            {requirements.satisfied.slice(0, 20).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-zinc-950">{item.title}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-500">
                    {item.category}
                  </span>
                </div>
                <div className="mt-1 leading-6">{item.detail}</div>
              </div>
            ))}
            {requirements.satisfied.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500">
                还没有满足项。先上传封面、背景或角色立绘。
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <div className="font-semibold text-zinc-950">{value}</div>
      <div className="mt-0.5 text-xs text-zinc-500">{label}</div>
    </div>
  );
}
