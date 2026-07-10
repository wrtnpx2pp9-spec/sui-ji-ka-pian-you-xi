import { getNodePresentation } from "@/lib/presentation";
import type { DemoAsset, DemoScript } from "@/lib/types";

const defaultSceneBackgroundUrl = "/assets/story/default-scene.png";

export type AssetRequirement = {
  id: string;
  category: "cover" | "background" | "character" | "expression";
  title: string;
  detail: string;
  status: "missing" | "satisfied";
  targetId?: string;
};

export type ScriptAssetRequirements = {
  missing: AssetRequirement[];
  satisfied: AssetRequirement[];
};

function isApproved(asset: DemoAsset | undefined) {
  return Boolean(asset && asset.status === "approved" && asset.fileUrl);
}

function isDefaultScene(asset: DemoAsset | undefined) {
  return !asset || asset.fileUrl === defaultSceneBackgroundUrl;
}

export function getScriptAssetRequirements(
  script: DemoScript,
): ScriptAssetRequirements {
  const missing: AssetRequirement[] = [];
  const satisfied: AssetRequirement[] = [];
  const assetsById = new Map(script.assets.map((asset) => [asset.id, asset]));
  const charactersByKey = new Map(
    script.characters.map((character) => [character.key, character]),
  );
  const cover = script.assets.find((asset) => asset.type === "cover");

  const push = (requirement: AssetRequirement) => {
    if (requirement.status === "missing") {
      missing.push(requirement);
    } else {
      satisfied.push(requirement);
    }
  };

  push({
    id: "cover",
    category: "cover",
    title: "作品封面",
    detail: cover
      ? "已登记封面资源。"
      : "公开列表和分享页需要一张作品封面。",
    status: isApproved(cover) ? "satisfied" : "missing",
    targetId: cover?.id,
  });

  for (const character of script.characters) {
    const defaultAsset = assetsById.get(character.defaultAssetId);

    push({
      id: `character-${character.id}`,
      category: "character",
      title: `${character.name} 默认立绘`,
      detail: isApproved(defaultAsset)
        ? "角色默认立绘可用。"
        : "角色页需要绑定一张 approved 的默认立绘。",
      status: isApproved(defaultAsset) ? "satisfied" : "missing",
      targetId: character.id,
    });
  }

  for (const node of script.nodes) {
    if (getNodePresentation(node, script) === "scene") {
      const background = assetsById.get(node.backgroundAssetId);

      push({
        id: `background-${node.id}`,
        category: "background",
        title: `${node.title || node.key} 场景背景`,
        detail:
          isApproved(background) && !isDefaultScene(background)
            ? "节点已绑定自有背景。"
            : "场景节点仍缺少自有背景，玩家端会退回默认贴图。",
        status:
          isApproved(background) && !isDefaultScene(background)
            ? "satisfied"
            : "missing",
        targetId: node.id,
      });
    }

    for (const line of node.dialogues) {
      const character = charactersByKey.get(line.speaker);
      const emotion = line.emotion.trim();

      if (!character || !emotion) {
        continue;
      }

      const expression = script.assets.find(
        (asset) =>
          asset.type === "expression" &&
          asset.characterId === character.id &&
          asset.emotion === emotion,
      );

      push({
        id: `expression-${character.id}-${emotion}`,
        category: "expression",
        title: `${character.name} / ${emotion} 表情`,
        detail: isApproved(expression)
          ? "对白情绪已有对应表情资源。"
          : "对白使用了该情绪，但角色还没有对应 expression 资源。",
        status: isApproved(expression) ? "satisfied" : "missing",
        targetId: character.id,
      });
    }
  }

  return {
    missing: uniqueRequirements(missing),
    satisfied: uniqueRequirements(satisfied),
  };
}

function uniqueRequirements(requirements: AssetRequirement[]) {
  const seen = new Set<string>();

  return requirements.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}
