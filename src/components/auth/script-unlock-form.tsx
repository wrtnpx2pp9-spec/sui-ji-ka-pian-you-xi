"use client";

import { LockKeyhole, Play } from "lucide-react";
import { useState } from "react";

export function ScriptUnlockForm({
  slug,
  playHref,
}: {
  slug: string;
  playHref: string;
}) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/scripts/${slug}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("剧本密码不正确");
      }

      window.location.assign(playHref);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "解锁失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 rounded-lg border border-zinc-200 bg-white p-4"
    >
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <LockKeyhole size={17} className="text-teal-700" />
        输入剧本密码后开始体验
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        剧本密码
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="input"
          autoComplete="off"
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
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        <Play size={17} />
        {submitting ? "解锁中" : "解锁并开始"}
      </button>
    </form>
  );
}
