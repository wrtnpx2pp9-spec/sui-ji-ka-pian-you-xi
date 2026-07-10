"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PhoneChatChoiceBar } from "@/components/play/chat/phone-chat-choice-bar";
import { PhoneChatScene } from "@/components/play/chat/phone-chat-scene";
import { SceneArtStage } from "@/components/play/scene-art-stage";
import type { DemoNode, DemoScript, DialogueLine } from "@/lib/types";
import { getNodePresentation } from "@/lib/presentation";
import {
  applyStatDelta,
  createInitialStats,
  formatDelta,
  getAsset,
  getNode,
  getStartNode,
} from "@/lib/play-engine";
import { getStoryLines, type StoryLine } from "@/lib/story-lines";

type PlaySnapshot = {
  node: DemoNode;
  lineIndex: number;
  stats: Record<string, number>;
  lastDelta: string[];
  lastReply?: string;
  freeLines: StoryLine[];
};

function getStorageKey(slug: string) {
  return `miaomi-play-progress:${slug}`;
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((item) => typeof item === "number")
  );
}

function readSnapshot(script: DemoScript, startNode: DemoNode): PlaySnapshot {
  const fallback: PlaySnapshot = {
    node: startNode,
    lineIndex: 0,
    stats: createInitialStats(script),
    lastDelta: [],
    lastReply: undefined,
    freeLines: [],
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(script.slug));
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;

    if (typeof parsed !== "object" || parsed === null) {
      return fallback;
    }

    const data = parsed as {
      nodeId?: unknown;
      lineIndex?: unknown;
      stats?: unknown;
      lastDelta?: unknown;
      lastReply?: unknown;
      freeLines?: unknown;
    };
    const node =
      typeof data.nodeId === "string" ? getNode(script, data.nodeId) : startNode;
    const maxLineIndex = Math.max(0, getStoryLines(node).length - 1);
    const lineIndex =
      typeof data.lineIndex === "number"
        ? Math.min(Math.max(0, data.lineIndex), maxLineIndex)
        : 0;
    const stats = isNumberRecord(data.stats)
      ? { ...createInitialStats(script), ...data.stats }
      : createInitialStats(script);
    const lastDelta = Array.isArray(data.lastDelta)
      ? data.lastDelta.filter((item): item is string => typeof item === "string")
      : [];
    const lastReply =
      typeof data.lastReply === "string" ? data.lastReply : undefined;
    const freeLines = Array.isArray(data.freeLines)
      ? data.freeLines.filter((item): item is StoryLine => {
          if (!item || typeof item !== "object") {
            return false;
          }

          const line = item as { kind?: unknown; text?: unknown };
          return (
            (line.kind === "narration" || line.kind === "dialogue") &&
            typeof line.text === "string"
          );
        })
      : [];

    return { node, lineIndex, stats, lastDelta, lastReply, freeLines };
  } catch {
    return fallback;
  }
}

export function ComicPlayer({ script }: { script: DemoScript }) {
  const startNode = useMemo(() => getStartNode(script), [script]);
  const storageKey = useMemo(() => getStorageKey(script.slug), [script.slug]);
  const [playState, setPlayState] = useState<PlaySnapshot>(() =>
    readSnapshot(script, startNode),
  );
  const { node, lineIndex, stats, lastDelta } = playState;
  const lastReply = playState.lastReply;
  const freeLines = playState.freeLines;

  const lines = useMemo(() => getStoryLines(node), [node]);
  const currentLine = lines[Math.min(lineIndex, lines.length - 1)];
  const background = getAsset(script, node.backgroundAssetId);
  const isLastLine = lineIndex >= lines.length - 1;
  const presentation = getNodePresentation(node, script);
  const isChatMode = presentation === "chat";
  const visibleLines = lines.slice(0, lineIndex + 1);
  const chatVisibleLines: StoryLine[] =
    isChatMode && lastReply
      ? [
          {
            kind: "dialogue",
            speaker: "player",
            emotion: "reply",
            text: lastReply,
            chatSide: "outgoing",
            deliveryStatus: "read",
          },
          ...visibleLines,
          ...freeLines,
        ]
      : [...visibleLines, ...freeLines];

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        nodeId: node.id,
        lineIndex,
        stats,
        lastDelta,
        lastReply,
        freeLines,
      }),
    );
  }, [freeLines, lastDelta, lastReply, lineIndex, node.id, stats, storageKey]);

  function choose(choiceId: string) {
    const choice = node.choices.find((item) => item.id === choiceId);

    if (!choice) {
      return;
    }

    const afterChoiceStats = applyStatDelta(stats, choice.statDelta);
    const nextNode = getNode(script, choice.nextNodeId);
    const afterNodeStats = applyStatDelta(afterChoiceStats, nextNode.statDelta);

    setPlayState({
      node: nextNode,
      lineIndex: 0,
      stats: afterNodeStats,
      lastDelta: [
        ...formatDelta(choice.statDelta, script),
        ...formatDelta(nextNode.statDelta, script),
      ],
      lastReply: choice.text,
      freeLines: [],
    });
  }

  function restart() {
    window.localStorage.removeItem(storageKey);
    setPlayState({
      node: startNode,
      lineIndex: 0,
      stats: createInitialStats(script),
      lastDelta: [],
      lastReply: undefined,
      freeLines: [],
    });
  }

  function continueLine() {
    setPlayState((current) => ({
      ...current,
      lineIndex: current.lineIndex + 1,
    }));
  }

  async function sendFreeReply(message: string) {
    const outgoingLine: StoryLine = {
      kind: "dialogue",
      speaker: "player",
      emotion: "reply",
      text: message,
      chatSide: "outgoing",
      deliveryStatus: "read",
    };

    setPlayState((current) => ({
      ...current,
      freeLines: [...current.freeLines, outgoingLine],
    }));

    try {
      const response = await fetch("/api/play/chat/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: script.slug,
          nodeId: node.id,
          message,
          stats,
        }),
      });

      if (!response.ok) {
        throw new Error("AI reply failed");
      }

      const data = (await response.json()) as {
        reply?: DialogueLine;
      };

      if (!data.reply?.text || !data.reply.speaker || !data.reply.emotion) {
        throw new Error("AI reply missing");
      }

      const replyLine: StoryLine = {
        ...data.reply,
        kind: "dialogue" as const,
      };

      setPlayState((current) => ({
        ...current,
        freeLines: [...current.freeLines, replyLine],
      }));
    } catch {
      setPlayState((current) => ({
        ...current,
        freeLines: [
          ...current.freeLines,
          {
            kind: "dialogue",
            speaker: "system",
            emotion: "notice",
            text: "对方暂时没有回复。你仍然可以选择下面的正式走向继续剧情。",
            chatSide: "system",
            chatKind: "notice",
          },
        ],
      }));
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col overflow-hidden bg-zinc-950 shadow-2xl">
        <header className="z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/90 px-4 py-3 backdrop-blur">
          <Link
            href="/scripts"
            className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="返回故事列表"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1 px-3 text-center">
            <p className="truncate text-xs text-teal-200">{script.title}</p>
            <h1 className="truncate text-base font-semibold">{node.chapter}</h1>
          </div>
          <button
            type="button"
            onClick={restart}
            className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="重新开始"
          >
            <RotateCcw size={18} />
          </button>
        </header>

        {isChatMode ? (
          <PhoneChatScene
            script={script}
            node={node}
            visibleLines={chatVisibleLines}
          />
        ) : (
          <SceneArtStage
            script={script}
            node={node}
            currentLine={currentLine}
            backgroundUrl={background?.fileUrl}
            backgroundName={background?.name ?? "默认场景贴图"}
          />
        )}

        <PhoneChatChoiceBar
          script={script}
          node={node}
          currentLine={currentLine}
          lineIndex={lineIndex}
          lineCount={lines.length}
          stats={stats}
          lastDelta={lastDelta}
          isLastLine={isLastLine}
          onContinue={continueLine}
          onChoose={choose}
          onFreeReply={isChatMode ? sendFreeReply : undefined}
          onRestart={restart}
          showCurrentLinePanel={isChatMode}
        />
      </div>
    </div>
  );
}
