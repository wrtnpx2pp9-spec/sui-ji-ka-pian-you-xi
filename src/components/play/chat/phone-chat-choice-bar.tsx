import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { getCharacter } from "@/lib/play-engine";
import type { DemoNode, DemoScript } from "@/lib/types";
import type { StoryLine } from "@/lib/story-lines";
import { EndingScoreCard } from "@/components/play/ending-score-card";
import { PhoneChatFreeReply } from "./phone-chat-free-reply";

export function PhoneChatChoiceBar({
  script,
  node,
  currentLine,
  lineIndex,
  lineCount,
  stats,
  lastDelta,
  isLastLine,
  onContinue,
  onChoose,
  onFreeReply,
  onRestart,
  showCurrentLinePanel = true,
}: {
  script: DemoScript;
  node: DemoNode;
  currentLine: StoryLine;
  lineIndex: number;
  lineCount: number;
  stats: Record<string, number>;
  lastDelta: string[];
  isLastLine: boolean;
  onContinue: () => void;
  onChoose: (choiceId: string) => void;
  onFreeReply?: (message: string) => Promise<void>;
  onRestart: () => void;
  showCurrentLinePanel?: boolean;
}) {
  const isEnding = node.nodeType === "ending";
  const canFreeReply =
    Boolean(onFreeReply) &&
    isLastLine &&
    !isEnding &&
    node.chatConfig?.allowFreeReply !== false;
  const speakerLabel =
    currentLine.kind === "dialogue"
      ? (getCharacter(script, currentLine.speaker)?.name ?? currentLine.speaker)
      : node.title;

  return (
    <section className="border-t border-white/10 bg-[#171717] px-4 pb-5 pt-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-zinc-300">
        <span className="inline-flex items-center gap-2">
          <Sparkles size={15} className="text-teal-300" />
          {speakerLabel}
        </span>
        <span>
          {lineIndex + 1}/{lineCount}
        </span>
      </div>

      {showCurrentLinePanel ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.07] p-3 text-sm leading-6 text-zinc-100 shadow-inner">
          {currentLine.text}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-5 gap-2">
        {script.stats
          .filter((stat) => stat.visible)
          .slice(0, 5)
          .map((stat) => (
            <div key={stat.key} className="min-w-0">
              <div className="mb-1 truncate text-[11px] text-zinc-400">
                {stat.name}
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-teal-300"
                  style={{ width: `${stats[stat.key] ?? 0}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      {lastDelta.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {lastDelta.map((delta) => (
            <span
              key={delta}
              className="rounded-full border border-teal-300/20 bg-teal-300/10 px-2 py-1 text-xs text-teal-100"
            >
              {delta}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {!isLastLine ? (
          <button
            type="button"
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f8fafc] px-4 py-3 text-sm font-medium text-zinc-950 shadow-sm transition hover:bg-teal-50"
          >
            继续
            <ChevronRight size={17} />
          </button>
        ) : isEnding ? (
          <EndingScoreCard script={script} stats={stats} onRestart={onRestart} />
        ) : (
          <>
            {canFreeReply && onFreeReply ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-2">
                <PhoneChatFreeReply
                  placeholder={node.chatConfig?.freeReplyPlaceholder}
                  onSend={onFreeReply}
                />
              </div>
            ) : null}
            {node.choices.length === 0 ? (
              <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-50">
                <div className="mb-1 font-semibold">故事暂未配置后续分支</div>
                当前节点还没有可选择的下一步。自由聊天仍会停留在这个节点内。
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={onRestart}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-zinc-950"
                  >
                    重新开始
                  </button>
                  <Link
                    href="/scripts"
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white"
                  >
                    返回列表
                  </Link>
                </div>
              </div>
            ) : (
              node.choices.map((choice) => (
                <button
                  type="button"
                  key={choice.id}
                  onClick={() => onChoose(choice.id)}
                  className="w-full rounded-lg border border-white/10 bg-[#f8fafc] px-4 py-3 text-left text-sm font-medium text-zinc-950 shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
                >
                  <span className="block">{choice.text}</span>
                  <span className="mt-1 block text-xs font-normal text-zinc-500">
                    {choice.description}
                  </span>
                </button>
              ))
            )}
          </>
        )}
      </div>
    </section>
  );
}
