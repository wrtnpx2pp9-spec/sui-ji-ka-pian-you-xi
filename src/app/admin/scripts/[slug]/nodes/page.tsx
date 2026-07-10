import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { NodeEditor } from "@/components/admin/node-editor";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function NodesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  return (
    <AdminShell
      title="剧情节点编辑"
      description="编辑节点大走向、旁白对白和分支跳转。当前保存到本地 data/scripts.json。"
    >
      <NodeEditor script={script} />
    </AdminShell>
  );
}
