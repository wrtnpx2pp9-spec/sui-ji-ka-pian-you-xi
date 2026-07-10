import Image from "next/image";
import Link from "next/link";
import { Clock, LockKeyhole, Play } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { readScripts } from "@/lib/script-store";

export default async function ScriptsPage() {
  const allScripts = await readScripts();
  const scripts = allScripts.filter((script) => script.status === "published");

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-5 py-8 text-zinc-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-700">体验入口</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              选择一个故事开始
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              每个故事都会自动载入对应的背景、角色和对话内容。
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scripts.map((script) => {
            const cover = script.assets.find((asset) => asset.type === "cover");
            const requiresPassword = Boolean(script.accessPassword?.trim());

            return (
              <Link
                key={script.id}
                href={`/scripts/${script.slug}`}
                className="overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-zinc-100">
                  {cover ? (
                    <Image
                      src={cover.fileUrl}
                      alt={cover.name}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      约 {script.estimatedMinutes} 分钟
                    </span>
                    {requiresPassword ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <LockKeyhole size={13} />
                        需密码
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-lg font-semibold">{script.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                    {script.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-700">
                    <Play size={16} />
                    进入故事
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
