import { MessageCircle } from "lucide-react";
import { getChatConfig } from "@/lib/chat-presentation";
import type { DemoNode, DemoScript } from "@/lib/types";
import type { StoryLine } from "@/lib/story-lines";
import { PhoneChatMessageList } from "./phone-chat-message-list";

export function PhoneChatScene({
  script,
  node,
  visibleLines,
}: {
  script: DemoScript;
  node: DemoNode;
  visibleLines: StoryLine[];
}) {
  const chatConfig = getChatConfig(node.title, node.chatConfig);

  return (
    <section className="relative flex min-h-[62vh] flex-1 flex-col overflow-hidden bg-[#e9edf2] text-zinc-950">
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-[#f8fafc] px-4 py-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-zinc-900 text-white">
          <MessageCircle size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {chatConfig.contactName}
          </div>
          <div className="text-xs text-zinc-500">{chatConfig.appName}</div>
        </div>
        <div className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700">
          {chatConfig.contactStatus}
        </div>
      </div>

      {chatConfig.safetyHint ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-900">
          {chatConfig.safetyHint}
        </div>
      ) : null}

      <PhoneChatMessageList
        script={script}
        lines={visibleLines}
        showTyping={chatConfig.showTyping}
        typingLabel={chatConfig.typingLabel}
      />
    </section>
  );
}
