"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubmitReviewButton({
  slug,
  disabled,
}: {
  slug: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/studio/scripts/${slug}/submit`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "提交审核失败");
      }

      setMessage("已提交审核，等待管理员处理。");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交审核失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={submit}
        disabled={busy || disabled}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} />
        {busy ? "提交中..." : "提交审核"}
      </button>
      {message ? <span className="text-sm text-zinc-600">{message}</span> : null}
    </div>
  );
}
