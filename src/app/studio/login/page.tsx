import { redirect } from "next/navigation";
import { CreatorLoginForm } from "@/components/auth/creator-login-form";
import { getCreatorSession } from "@/lib/creator-auth";
import { isSafeNextPath } from "@/lib/auth-shared";

export default async function StudioLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = isSafeNextPath(next) ? next : "/studio";

  if (await getCreatorSession()) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-5 py-10 text-zinc-950">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-medium text-teal-700">Creator Studio</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">
            制作可以发布的剧本游戏
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600">
            使用邀请码进入工作台，创建剧本、上传美术、编辑分支节点，并提交给管理员审核发布。
          </p>
          <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
            开发默认邀请码：创作者 creator-demo，管理员 admin-demo。
          </div>
        </div>

        <CreatorLoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
