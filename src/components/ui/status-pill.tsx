const statusLabels: Record<string, string> = {
  draft: "草稿",
  ai_generating: "AI 生成中",
  editing: "编辑中",
  testing: "测试中",
  review: "审核中",
  published: "已发布",
  archived: "已下架",
  completed: "已完成",
  applied: "已应用",
  pending: "待处理",
  running: "运行中",
  failed: "失败",
};

const statusClasses: Record<string, string> = {
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  applied: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-teal-200 bg-teal-50 text-teal-700",
  review: "border-amber-200 bg-amber-50 text-amber-700",
  testing: "border-sky-200 bg-sky-50 text-sky-700",
  ai_generating: "border-violet-200 bg-violet-50 text-violet-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        statusClasses[status] ?? "border-zinc-200 bg-zinc-50 text-zinc-600"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
