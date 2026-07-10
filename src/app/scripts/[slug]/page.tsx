import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, LockKeyhole, Play, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { ScriptUnlockForm } from "@/components/auth/script-unlock-form";
import { isScriptUnlocked, scriptRequiresPassword } from "@/lib/auth";
import { getStoredScriptBySlug } from "@/lib/script-store";

export default async function ScriptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script || script.status !== "published") {
    notFound();
  }

  const cover = script.assets.find((asset) => asset.type === "cover");
  const isLocked = !(await isScriptUnlocked(script));
  const requiresPassword = scriptRequiresPassword(script);

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-5 py-8 text-zinc-950">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/scripts"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
        >
          <ArrowLeft size={16} />
          返回故事列表
        </Link>

        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <div className="relative aspect-[3/4]">
              {cover ? (
                <Image
                  src={cover.fileUrl}
                  alt={cover.name}
                  fill
                  priority
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-teal-700">{script.theme}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {script.title}
            </h1>
            <p className="mt-3 text-lg text-zinc-700">{script.subtitle}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600">
              {script.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {script.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                <Clock size={16} className="text-teal-700" />
                约 {script.estimatedMinutes} 分钟
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                <Play size={16} className="text-teal-700" />
                互动剧情体验
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <ShieldAlert size={16} />
                内容提示
              </div>
              {script.contentWarning}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {isLocked ? (
                <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  <LockKeyhole size={17} />
                  输入密码后开始
                </div>
              ) : (
                <Link
                  href={`/play/${script.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  <Play size={17} />
                  开始体验
                </Link>
              )}
            </div>

            {requiresPassword && isLocked ? (
              <ScriptUnlockForm
                slug={script.slug}
                playHref={`/play/${script.slug}`}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
