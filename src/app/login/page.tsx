import { LoginForm } from "@/components/auth/login-form";
import { isPlayerAuthenticated } from "@/lib/auth";
import { isSafeNextPath } from "@/lib/auth-shared";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = isSafeNextPath(next) ? next : "/scripts";

  if (await isPlayerAuthenticated()) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-5 py-10 text-zinc-950">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-medium text-teal-700">内测体验</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">
            输入密钥后开始
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600">
            这里是故事体验入口。登录后可以选择剧本，必要时输入剧本密码，然后直接进入互动剧情。
          </p>
        </div>

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
