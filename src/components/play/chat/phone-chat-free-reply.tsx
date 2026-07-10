"use client";

import { Send } from "lucide-react";
import { type FormEvent, useState } from "react";

export function PhoneChatFreeReply({
  disabled,
  placeholder,
  onSend,
}: {
  disabled?: boolean;
  placeholder?: string;
  onSend: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();

    if (!text || sending || disabled) {
      return;
    }

    setSending(true);

    try {
      await onSend(text);
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-[1fr_auto] gap-2">
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={disabled || sending}
        className="min-w-0 rounded-lg border border-white/10 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-teal-300 disabled:opacity-60"
        placeholder={placeholder ?? "输入一句你想说的话"}
      />
      <button
        type="submit"
        disabled={disabled || sending || !message.trim()}
        className="inline-flex size-11 items-center justify-center rounded-lg bg-teal-300 text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="发送"
        title="发送"
      >
        <Send size={17} />
      </button>
    </form>
  );
}
