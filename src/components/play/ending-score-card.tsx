import Link from "next/link";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { getEndingScore } from "@/lib/ending-score";
import type { DemoScript } from "@/lib/types";

export function EndingScoreCard({
  script,
  stats,
  onRestart,
}: {
  script: DemoScript;
  stats: Record<string, number>;
  onRestart: () => void;
}) {
  const result = getEndingScore(script, stats);

  return (
    <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-50">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck size={16} />
          已抵达结局
        </div>
        <div className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-950">
          {result.score} 分
        </div>
      </div>
      <div className="text-base font-semibold">{result.rank}</div>
      <p className="mt-1 leading-6 text-emerald-50/90">{result.note}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-zinc-950"
        >
          <RotateCcw size={14} />
          重新开始
        </button>
        <Link
          href="/scripts"
          className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white"
        >
          选择其他故事
        </Link>
      </div>
    </div>
  );
}
