import type { ReactNode } from "react";

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-semibold">{title}</div>
        {action}
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

export function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-zinc-950">
        {value}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      {label}
      {children}
    </label>
  );
}
