import { notFound, redirect } from "next/navigation";
import { ComicPlayer } from "@/components/play/comic-player";
import { isScriptUnlocked, stripScriptSecrets } from "@/lib/auth";
import { readScripts } from "@/lib/script-store";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ scriptId: string }>;
}) {
  const { scriptId } = await params;
  const scripts = await readScripts();
  const script = scripts.find(
    (item) => item.id === scriptId || item.slug === scriptId,
  );

  if (!script || script.status !== "published") {
    notFound();
  }

  if (!(await isScriptUnlocked(script))) {
    redirect(`/scripts/${script.slug}`);
  }

  return <ComicPlayer script={stripScriptSecrets(script)} />;
}
