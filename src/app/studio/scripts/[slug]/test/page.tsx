import { notFound, redirect } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import { ComicPlayer } from "@/components/play/comic-player";
import { assertCanEditScript, getCreatorSession } from "@/lib/creator-auth";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function StudioTestPage({
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
      title="预览测试"
      description="用公开前台同一套播放组件检查流程、选项和资源效果。"
      session={session}
    >
      <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white">
        <ComicPlayer script={script} />
      </div>
    </StudioShell>
  );
}
