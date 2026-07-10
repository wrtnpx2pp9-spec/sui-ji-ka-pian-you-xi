import Link from "next/link";
import {
  Clapperboard,
  FilePenLine,
  FilePlus2,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/admin/scripts", label: "剧本项目", icon: Clapperboard },
  { href: "/admin/scripts/new", label: "创建剧本", icon: FilePlus2 },
];

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f4] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white/85 px-4 py-5 backdrop-blur lg:block">
        <Link href="/admin/scripts" className="flex items-center gap-3 px-2">
          <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <LayoutDashboard size={20} />
          </span>
          <span>
            <span className="block text-sm font-semibold">剧本生产台</span>
            <span className="block text-xs text-zinc-500">内部管理后台</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
          <div className="mb-1 flex items-center gap-2 font-medium text-zinc-900">
            <FilePenLine size={15} />
            工作区
          </div>
          后台只负责内容生产、审核和发布；用户端只负责选择剧本和体验。
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="border-b border-zinc-200 bg-white/80 px-5 py-5 backdrop-blur lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-700">
              Internal Studio
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              {description}
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
