import Image from "next/image";
import type { DemoScript } from "@/lib/types";
import {
  getChatDelivery,
  getChatKind,
  getChatSide,
} from "@/lib/chat-presentation";
import { getAsset, getCharacter } from "@/lib/play-engine";
import type { StoryLine } from "@/lib/story-lines";

export function PhoneChatMessageList({
  script,
  lines,
  showTyping,
  typingLabel,
}: {
  script: DemoScript;
  lines: StoryLine[];
  showTyping: boolean;
  typingLabel: string;
}) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {lines.map((line, index) => {
        if (line.kind === "narration") {
          return (
            <div
              key={`narration-${index}`}
              className="mx-auto max-w-[88%] rounded-lg bg-white/70 px-3 py-2 text-xs leading-5 text-zinc-600 shadow-sm"
            >
              {line.text}
            </div>
          );
        }

        const character = getCharacter(script, line.speaker);
        const chatSide = getChatSide(line, script);
        const chatKind = getChatKind(line);
        const delivery = getChatDelivery(line);
        const isOutgoing = chatSide === "outgoing";
        const imageAsset = line.assetId ? getAsset(script, line.assetId) : null;
        const deliveryLabel =
          delivery === "read"
            ? "已读"
            : delivery === "delivered"
              ? "已送达"
              : delivery === "sent"
                ? "已发送"
                : "";

        if (chatSide === "system" || chatKind === "notice") {
          return (
            <div
              key={`${line.speaker}-${index}`}
              className="mx-auto max-w-[88%] rounded-full bg-zinc-300/70 px-3 py-1.5 text-center text-xs leading-5 text-zinc-600"
            >
              {line.timestamp ? (
                <span className="mr-2 text-zinc-500">{line.timestamp}</span>
              ) : null}
              {line.text}
            </div>
          );
        }

        return (
          <div
            key={`${line.speaker}-${index}`}
            className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[82%] gap-2 ${
                isOutgoing ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isOutgoing
                    ? "bg-[#95ec69] text-zinc-900"
                    : "bg-white text-zinc-600"
                }`}
              >
                {(character?.name ?? line.speaker).slice(0, 1)}
              </div>
              <div className={isOutgoing ? "items-end" : "items-start"}>
                <div className="mb-1 px-1 text-[11px] text-zinc-500">
                  {line.timestamp ? `${line.timestamp} · ` : ""}
                  {character?.name ?? line.speaker}
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${
                    isOutgoing
                      ? "rounded-br-sm bg-[#95ec69] text-zinc-950"
                      : "rounded-bl-sm bg-white text-zinc-950"
                  }`}
                >
                  {chatKind === "image" && imageAsset ? (
                    <div className="overflow-hidden rounded-xl">
                      <Image
                        src={imageAsset.fileUrl}
                        alt={imageAsset.name}
                        width={220}
                        height={160}
                        className="max-h-48 w-full object-cover"
                      />
                    </div>
                  ) : null}
                  {line.text ? (
                    <div
                      className={chatKind === "image" && imageAsset ? "mt-2" : ""}
                    >
                      {line.text}
                    </div>
                  ) : null}
                </div>
                {isOutgoing && deliveryLabel ? (
                  <div className="mt-1 px-1 text-right text-[11px] text-zinc-500">
                    {deliveryLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
      {showTyping ? (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-xs text-zinc-500 shadow-sm">
            {typingLabel}
          </div>
        </div>
      ) : null}
    </div>
  );
}
