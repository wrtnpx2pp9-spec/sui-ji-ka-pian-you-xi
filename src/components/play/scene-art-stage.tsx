import Image from "next/image";
import { getAsset, getCharacter } from "@/lib/play-engine";
import type { DemoNode, DemoScript } from "@/lib/types";
import type { StoryLine } from "@/lib/story-lines";

export const DEFAULT_SCENE_ASSET = "/assets/story/default-scene.png";

export function SceneArtStage({
  script,
  node,
  currentLine,
  backgroundUrl,
  backgroundName,
  showChoices = false,
  compact = false,
  className = "",
}: {
  script: DemoScript;
  node: DemoNode;
  currentLine: StoryLine;
  backgroundUrl?: string;
  backgroundName?: string;
  showChoices?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const speaker =
    currentLine.kind === "dialogue"
      ? (getCharacter(script, currentLine.speaker)?.name ?? currentLine.speaker)
      : node.title;
  const resolvedBackgroundUrl = backgroundUrl || DEFAULT_SCENE_ASSET;
  const resolvedBackgroundName = backgroundName || "默认场景贴图";
  const stageSize = compact ? "min-h-[440px]" : "min-h-[64vh] flex-1";
  const dialoguePosition = node.sceneConfig?.dialoguePosition ?? "bottom";
  const dialogueVariant = node.sceneConfig?.dialogueVariant ?? "glass";
  const shouldDimBackground = node.sceneConfig?.dimBackground !== false;
  const dialoguePositionClass =
    dialoguePosition === "top"
      ? "top-20"
      : dialoguePosition === "middle"
        ? "top-1/2 -translate-y-1/2"
        : showChoices
          ? "bottom-[108px]"
          : "bottom-5";
  const dialogueSurfaceClass =
    dialogueVariant === "solid"
      ? "border-white/70 bg-zinc-950 text-white"
      : "border-white/35 bg-zinc-950/78 text-white backdrop-blur-md";

  return (
    <section
      className={`relative overflow-hidden bg-zinc-950 ${stageSize} ${className}`}
    >
      <Image
        src={resolvedBackgroundUrl}
        alt={resolvedBackgroundName}
        fill
        priority={!compact}
        sizes={
          compact
            ? "(max-width: 768px) 100vw, 380px"
            : "(max-width: 480px) 100vw, 480px"
        }
        className="object-cover saturate-[1.03]"
      />

      {shouldDimBackground ? (
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/76" />
      ) : null}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        {node.title}
      </div>

      {node.characterBindings.map((binding) => {
        const asset = getAsset(script, binding.assetId);
        const character = getCharacter(script, binding.characterId);

        if (!asset || !character) {
          return null;
        }

        const positionClass =
          binding.position === "left"
            ? "left-[-10px] items-start"
            : binding.position === "right"
              ? "right-[-10px] items-end"
              : "left-1/2 -translate-x-1/2 items-center";

        const imageClass =
          binding.position === "left"
            ? "origin-bottom-left"
            : binding.position === "right"
              ? "origin-bottom-right"
              : "origin-bottom";

        return (
          <div
            key={`${binding.characterId}-${binding.assetId}`}
            className={`absolute bottom-0 flex w-[54%] flex-col ${positionClass}`}
          >
            <Image
              src={asset.fileUrl}
              alt={asset.name}
              width={300}
              height={560}
              className={`relative z-10 h-[50vh] max-h-[560px] w-auto object-contain drop-shadow-2xl ${imageClass}`}
            />
          </div>
        );
      })}

      <div className={`absolute inset-x-4 ${dialoguePositionClass} z-20`}>
        <div className={`rounded-lg border px-4 py-3 shadow-2xl ${dialogueSurfaceClass}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-semibold text-teal-100">
              {speaker}
            </span>
            <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] text-zinc-200">
              {node.chapter}
            </span>
          </div>
          <p className="line-clamp-4 text-[15px] leading-7 text-zinc-50">
            {currentLine.text}
          </p>
        </div>
      </div>

      {showChoices ? (
        <div className="absolute inset-x-4 bottom-4 z-20 grid gap-2">
          {node.choices.length > 0 ? (
            node.choices.slice(0, 2).map((choice) => (
              <div
                key={choice.id}
                className="truncate rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm font-medium text-zinc-950 shadow-lg"
              >
                {choice.text}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-amber-200/50 bg-amber-50/90 px-3 py-2 text-sm font-medium text-amber-950 shadow-lg">
              当前节点还没有选项
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
