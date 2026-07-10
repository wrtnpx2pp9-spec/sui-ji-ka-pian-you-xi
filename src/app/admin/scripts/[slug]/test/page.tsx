import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ComicPlayer } from "@/components/play/comic-player";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function TestPlayPage({
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
      title="测试游玩"
      description="这里复用前台演出组件，用于检查节点跳转、属性变化、气泡和美术绑定。"
    >
      <div className="grid gap-6 xl:grid-cols-[520px_1fr]">
        <div className="overflow-hidden rounded-xl border border-zinc-300">
          <ComicPlayer script={script} />
        </div>
        <aside className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold">测试关注点</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <li>开始节点是否正确进入。</li>
            <li>每个选择是否跳到预期节点。</li>
            <li>属性变化是否符合剧情后果。</li>
            <li>角色气泡是否遮挡关键画面。</li>
            <li>结局是否有足够的反思和止损提示。</li>
          </ul>
        </aside>
      </div>
    </AdminShell>
  );
}
