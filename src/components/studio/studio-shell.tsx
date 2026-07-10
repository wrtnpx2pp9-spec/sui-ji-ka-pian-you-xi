import Link from "next/link";
import { Clapperboard, FilePlus2, LayoutDashboard } from "lucide-react";
import { CreatorLogoutButton } from "@/components/studio/creator-logout-button";
import type { CreatorSession } from "@/lib/creator-auth";

const navItems = [
  { href: "/studio", label: "我的作品", icon: Clapperboard },
  { href: "/studio/scripts/new", label: "创建作品", icon: FilePlus2 },
];

export function StudioShell({
  title,
  description,
  session,
  children,
}: {
  title: string;
  description: string;
  session: CreatorSession;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f4] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white/85 px-4 py-5 backdrop-blur lg:block">
        <Link href="/studio" className="flex items-center gap-3 px-2">
          <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <LayoutDashboard size={20} />
          </span>
          <span>
            <span className="block text-sm font-semibold">创作者工作台</span>
            <span className="block text-xs text-zinc-500">
              {session.displayName}
            </span>
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

        <div className="absolute bottom-5 left-4 right-4">
          <CreatorLogoutButton />
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="border-b border-zinc-200 bg-white/80 px-5 py-5 backdrop-blur lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-700">
              Creator Studio
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
