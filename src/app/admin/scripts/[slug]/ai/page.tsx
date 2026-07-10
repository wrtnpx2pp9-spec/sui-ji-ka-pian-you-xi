import { notFound } from "next/navigation";
import { Bot, RotateCw } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusPill } from "@/components/ui/status-pill";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function AiJobsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  const templates = [
    "生成剧本策划案",
    "生成角色设定",
    "生成剧情节点草稿",
    "生成美术资源需求",
    "生成节点对白旁白",
    "一致性检查",
  ];

  return (
    <AdminShell
      title="AI 生产任务"
      description="AI 只负责生产草稿和检查报告，所有结果必须人工确认后才会应用到剧本。"
    >
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template}
            type="button"
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 text-left text-sm font-medium hover:border-teal-200 hover:bg-teal-50"
          >
            <span className="flex items-center gap-2">
              <Bot size={17} className="text-teal-700" />
              {template}
            </span>
            <RotateCw size={15} className="text-zinc-400" />
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {script.aiJobs.map((job) => (
          <article
            key={job.id}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <StatusPill status={job.status} />
                  <span className="text-xs text-zinc-500">{job.jobType}</span>
                </div>
                <h2 className="text-lg font-semibold">{job.title}</h2>
              </div>
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                查看输出
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {job.description}
            </p>
            <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
              {job.outputPreview}
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
