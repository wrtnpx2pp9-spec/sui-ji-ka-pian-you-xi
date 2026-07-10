"use client";

import { KeyRound, LogIn } from "lucide-react";
import { useState } from "react";

export function CreatorLoginForm({ nextPath }: { nextPath: string }) {
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/creator-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        throw new Error("邀请码不正确或已停用");
      }

      window.location.assign(nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-900/5"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
          <KeyRound size={18} />
        </span>
        <div>
          <h2 className="font-semibold">创作者邀请码</h2>
          <p className="text-sm text-zinc-500">用于进入剧本制作工作台</p>
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        邀请码
        <input
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </label>

      {message ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        <LogIn size={17} />
        {submitting ? "验证中" : "进入工作台"}
      </button>
    </form>
  );
}
