import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  Eye,
  Images,
  PlayCircle,
  Users,
  Workflow,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteScriptButton } from "@/components/admin/delete-script-button";
import { ScriptEditor } from "@/components/admin/script-editor";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getPresentationShortLabel,
  getScriptDefaultPresentation,
} from "@/lib/presentation";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function AdminScriptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  const presentation = getScriptDefaultPresentation(script);
  const productionLinks = [
    {
      href: `/admin/scripts/${script.slug}/characters`,
      label: "角色设定",
      icon: Users,
    },
    {
      href: `/admin/scripts/${script.slug}/assets`,
      label: "美术资源",
      icon: Images,
    },
    {
      href: `/admin/scripts/${script.slug}/nodes`,
      label: "编辑节点",
      icon: Workflow,
    },
    {
      href: `/admin/scripts/${script.slug}/ai`,
      label: "AI 任务",
      icon: Bot,
    },
    {
      href: `/admin/scripts/${script.slug}/test`,
      label: "测试游玩",
      icon: PlayCircle,
    },
    {
      href: `/admin/scripts/${script.slug}/review`,
      label: "审核发布",
      icon: CheckCircle2,
    },
  ];

  return (
    <AdminShell
      title={`${script.title}：剧本编辑`}
      description="编辑剧本定位、内容边界和用户端呈现信息。角色、美术、节点和测试会在各自生产页继续完成。"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={script.status} />
          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
            {getPresentationShortLabel(presentation)}
          </span>
          <span className="text-sm text-zinc-500">{script.theme}</span>
          <span className="text-sm text-zinc-500">
            {script.nodes.length} 个节点
          </span>
          <span className="text-sm text-zinc-500">
            {script.assets.length} 个资源
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {productionLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href={`/scripts/${script.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Eye size={16} />
            用户端预览
          </Link>
          <DeleteScriptButton
            slug={script.slug}
            title={script.title}
            redirectTo="/admin/scripts"
          />
        </div>
      </div>

      <ScriptEditor initialScript={script} />
    </AdminShell>
  );
}
