import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NodeEditor } from "@/components/admin/node-editor";
import { StudioShell } from "@/components/studio/studio-shell";
import { assertCanEditScript, getCreatorSession } from "@/lib/creator-auth";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function StudioNodesPage({
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

  return (
    <StudioShell
      title="节点编辑"
      description="在这里编辑分支、对白和演出。创作者模式会隐藏 AI 草稿按钮和管理员专用动作。"
      session={session}
    >
      <div className="mb-4">
        <Link
          href={`/studio/scripts/${script.slug}`}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          <ArrowLeft size={16} />
          返回作品页
        </Link>
      </div>
      <NodeEditor
        script={script}
        apiBasePath="/api/studio/scripts"
        assetBasePath={`/studio/scripts/${script.slug}`}
        allowAiDraft={false}
      />
    </StudioShell>
  );
}
