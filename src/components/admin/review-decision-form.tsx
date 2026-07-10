"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewDecisionForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | "">("");
  const [message, setMessage] = useState("");

  async function decide(action: "approve" | "reject") {
    setBusyAction(action);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/scripts/${slug}/review-decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "审核操作失败");
      }

      setMessage(action === "approve" ? "已发布。" : "已驳回给创作者。");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "审核操作失败");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold">审核决定</h2>
      <label className="mt-4 grid gap-2 text-sm font-medium text-zinc-800">
        审核意见
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="input"
          placeholder="写给创作者的修改说明或发布备注"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => decide("approve")}
          disabled={Boolean(busyAction)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          <CheckCircle2 size={16} />
          {busyAction === "approve" ? "发布中..." : "通过并发布"}
        </button>
        <button
          type="button"
          onClick={() => decide("reject")}
          disabled={Boolean(busyAction)}
          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
        >
          <XCircle size={16} />
          {busyAction === "reject" ? "驳回中..." : "驳回修改"}
        </button>
        {message ? <span className="text-sm text-zinc-600">{message}</span> : null}
      </div>
    </section>
  );
}
