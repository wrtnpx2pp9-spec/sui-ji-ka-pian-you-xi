import { promises as fs } from "fs";
import path from "path";
import { demoScripts } from "./demo-data";
import type {
  AssetType,
  CharacterRoleType,
  DemoAsset,
  DemoCharacter,
  DemoChoice,
  DemoNode,
  DemoScript,
  NodePresentation,
} from "./types";
import { getScriptDefaultPresentation, isNodePresentation } from "./presentation";

const dataDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const scriptsFile = path.join(dataDir, "scripts.json");
const defaultSceneBackgroundUrl = "/assets/story/default-scene.png";

async function ensureStoreFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(scriptsFile);
  } catch {
    await fs.writeFile(
      scriptsFile,
      JSON.stringify(demoScripts, null, 2),
      "utf8",
    );
  }
}

export async function readScripts(): Promise<DemoScript[]> {
  await ensureStoreFile();

  const raw = await fs.readFile(scriptsFile, "utf8");
  return (JSON.parse(raw) as DemoScript[]).map((script) => ({
    ...script,
    ownerId: script.ownerId ?? "admin",
  }));
}

export async function writeScripts(scripts: DemoScript[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(scriptsFile, JSON.stringify(scripts, null, 2), "utf8");
}

export async function getStoredScriptBySlug(slug: string) {
  const scripts = await readScripts();
  return scripts.find((script) => script.slug === slug);
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `script-${Date.now()}`;
}

function uniqueSlug(baseSlug: string, scripts: DemoScript[]) {
  let slug = baseSlug;
  let index = 2;

  while (scripts.some((script) => script.slug === slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

export type CreateStoredScriptInput = {
  title: string;
  ownerId?: string;
  slug?: string;
  subtitle?: string;
  description: string;
  theme: string;
  style?: string;
  tags?: string[];
  targetAudience?: string;
  contentWarning?: string;
  accessPassword?: string;
  defaultPresentation?: NodePresentation;
  estimatedMinutes?: number;
  planning?: Partial<DemoScript["planning"]>;
  characterDrafts?: Array<{
    key?: string;
    name: string;
    roleType?: string;
    description?: string;
  }>;
  backgroundDrafts?: Array<{
    key?: string;
    name: string;
    fileUrl: string;
  }>;
  nodeDrafts?: Array<{
    title: string;
    chapter?: string;
    summary?: string;
    goal?: string;
    tone?: string;
    nodeType?: DemoNode["nodeType"];
    presentation?: NodePresentation;
    choices?: Array<{
      text: string;
      targetIndex: number;
    }>;
  }>;
};

const characterRoleTypes: CharacterRoleType[] = [
  "protagonist",
  "ally",
  "risk_object",
  "family",
  "authority",
  "side",
  "system",
];

function toCharacterRoleType(value?: string): CharacterRoleType {
  return characterRoleTypes.includes(value as CharacterRoleType)
    ? (value as CharacterRoleType)
    : "protagonist";
}

function uniqueKey(baseKey: string, existing: Set<string>) {
  const fallback = baseKey || `item-${Date.now()}`;
  let key = fallback;
  let index = 2;

  while (existing.has(key)) {
    key = `${fallback}-${index}`;
    index += 1;
  }

  existing.add(key);
  return key;
}

function buildCharacters(
  scriptId: string,
  drafts: CreateStoredScriptInput["characterDrafts"],
): DemoCharacter[] {
  const existing = new Set<string>();

  return (drafts ?? [])
    .filter((draft) => draft.name.trim())
    .map((draft, index) => {
      const key = uniqueKey(
        toSlug(draft.key?.trim() || draft.name || `character-${index + 1}`),
        existing,
      );
      const description = draft.description?.trim() ?? "";

      return {
        id: `${scriptId}-character-${index + 1}`,
        key,
        name: draft.name.trim(),
        roleType: toCharacterRoleType(draft.roleType),
        description,
        personality: description,
        narrativeFunction: description || "待补充角色在剧情中的功能。",
        defaultAssetId: "",
      };
    });
}

function uniqueAssetKey(baseKey: string, assets: DemoAsset[]) {
  let key = baseKey || `asset-${Date.now()}`;
  let index = 2;

  while (assets.some((asset) => asset.key === key)) {
    key = `${baseKey}-${index}`;
    index += 1;
  }

  return key;
}

function buildBackgroundAssets(
  scriptId: string,
  drafts: CreateStoredScriptInput["backgroundDrafts"],
): DemoAsset[] {
  const assets: DemoAsset[] = [];

  for (const [index, draft] of (drafts ?? []).entries()) {
    if (!draft.name.trim() || !draft.fileUrl.trim()) {
      continue;
    }

    assets.push({
      id: `${scriptId}-background-${index + 1}`,
      key: uniqueAssetKey(
        toSlug(draft.key?.trim() || draft.name || `background-${index + 1}`),
        assets,
      ),
      name: draft.name.trim(),
      type: "background",
      fileUrl: draft.fileUrl.trim(),
      status: "approved",
    });
  }

  return assets.length > 0
    ? assets
    : [
        {
          id: `${scriptId}-background-default`,
          key: "default-scene",
          name: "默认场景贴图",
          type: "background",
          fileUrl: defaultSceneBackgroundUrl,
          status: "approved",
        },
      ];
}

function buildInitialNodes({
  scriptId,
  drafts,
  tone,
  backgroundAssetId,
  presentation,
}: {
  scriptId: string;
  drafts: CreateStoredScriptInput["nodeDrafts"];
  tone: string;
  backgroundAssetId: string;
  presentation: NodePresentation;
}): DemoNode[] {
  const filledDrafts = (drafts ?? []).filter((draft) => draft.title.trim());
  const sourceDrafts =
    filledDrafts.length > 0
      ? filledDrafts
      : [
          {
            title: "开场",
            chapter: "第一章",
            goal: "建立主角处境、核心张力和第一次可行动判断点。",
          },
        ];

  return sourceDrafts.map((draft, index, allDrafts) => {
    const id = `${scriptId}-node-${index + 1}`;
    const nextNodeId =
      index < allDrafts.length - 1 ? `${scriptId}-node-${index + 2}` : "";
    const title = draft.title.trim();
    const chapter = draft.chapter?.trim() || `第 ${index + 1} 节`;
    const summary =
      draft.summary?.trim() ||
      draft.goal?.trim() ||
      "写下这个节点里真正发生的事。";
    const goal =
      draft.goal?.trim() ||
      "写清本节点要推进的关系变化、风险变化或关键判断。";
    const explicitChoices =
      draft.choices
        ?.filter(
          (choice) =>
            choice.text.trim() &&
            choice.targetIndex >= 0 &&
            choice.targetIndex < allDrafts.length,
        )
        .map((choice, choiceIndex) => ({
          id: `${scriptId}-choice-${index + 1}-${choiceIndex + 1}`,
          text: choice.text.trim(),
          description: `进入「${allDrafts[choice.targetIndex].title.trim()}」。`,
          nextNodeId: `${scriptId}-node-${choice.targetIndex + 1}`,
          statDelta: {},
        })) ?? [];
    const linearChoices =
      nextNodeId && explicitChoices.length === 0
        ? [
            {
              id: `${scriptId}-choice-${index + 1}`,
              text: "继续",
              description: `进入「${allDrafts[index + 1].title.trim()}」。`,
              nextNodeId,
              statDelta: {},
            },
          ]
        : [];
    const nodePresentation = draft.presentation ?? presentation;

    return {
      id,
      key: index === 0 ? "start" : `node_${index + 1}`,
      title,
      nodeType: draft.nodeType ?? (index === 0 ? "start" : "normal"),
      chapter,
      summary,
      goal,
      tone: draft.tone?.trim() || tone,
      presentation: nodePresentation,
      sceneConfig:
        nodePresentation === "scene"
          ? {
              dialoguePosition: "bottom",
              dialogueVariant: "glass",
              dimBackground: true,
            }
          : undefined,
      chatConfig:
        nodePresentation === "chat"
          ? {
              appName: "私信",
              contactName: title,
              contactStatus: "在线",
              showTyping: false,
            }
          : undefined,
      backgroundAssetId,
      characterBindings: [],
      statDelta: {},
      narration: summary,
      dialogues: [],
      choices: [...explicitChoices, ...linearChoices],
    };
  });
}

export async function createStoredScript(input: CreateStoredScriptInput) {
  const scripts = await readScripts();
  const slug = uniqueSlug(toSlug(input.slug || input.title), scripts);
  const id = `script-${Date.now()}`;
  const tone = input.planning?.tone?.trim() || "真实、克制、有张力";
  const defaultPresentation = isNodePresentation(input.defaultPresentation)
    ? input.defaultPresentation
    : "scene";
  const characters = buildCharacters(id, input.characterDrafts);
  const assets = buildBackgroundAssets(id, input.backgroundDrafts);
  const nodes = buildInitialNodes({
    scriptId: id,
    drafts: input.nodeDrafts,
    tone,
    backgroundAssetId: assets[0]?.id ?? "",
    presentation: defaultPresentation,
  });

  const script: DemoScript = {
    id,
    slug,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() ?? "",
    description: input.description.trim(),
    theme: input.theme.trim(),
    style: input.style?.trim() || "现实、克制、沉浸式互动剧情",
    tags: input.tags ?? [],
    targetAudience: input.targetAudience?.trim() || "内部测试用户",
    contentWarning: input.contentWarning?.trim() ?? "",
    accessPassword: input.accessPassword?.trim() || undefined,
    ownerId: input.ownerId ?? "admin",
    defaultPresentation,
    status: "draft",
    estimatedMinutes: input.estimatedMinutes ?? 15,
    planning: {
      logline: input.planning?.logline?.trim() ?? "",
      playerGoal: input.planning?.playerGoal?.trim() ?? "",
      mainConflict: input.planning?.mainConflict?.trim() ?? "",
      tone,
      safetyBoundary: input.planning?.safetyBoundary?.trim() ?? "",
    },
    stats: [
      {
        key: "clarity",
        name: "清醒度",
        description: "玩家识别风险、保持判断的程度。",
        initialValue: 50,
        visible: true,
      },
      {
        key: "support",
        name: "支持度",
        description: "玩家能获得朋友、家人或外部资源支持的程度。",
        initialValue: 50,
        visible: true,
      },
      {
        key: "risk",
        name: "风险",
        description: "局面继续恶化的可能性。",
        initialValue: 20,
        visible: true,
      },
      {
        key: "evidence",
        name: "证据",
        description: "玩家保留关键信息和行动依据的完整度。",
        initialValue: 0,
        visible: true,
      },
    ],
    characters,
    assets,
    nodes,
    aiJobs: [],
  };

  scripts.unshift(script);
  await writeScripts(scripts);

  return script;
}

export async function updateStoredScript(
  slug: string,
  patch: Partial<DemoScript>,
) {
  const scripts = await readScripts();
  const index = scripts.findIndex((script) => script.slug === slug);

  if (index === -1) {
    return null;
  }

  const current = scripts[index];
  const next: DemoScript = {
    ...current,
    ...patch,
    id: current.id,
    slug: current.slug,
    defaultPresentation: isNodePresentation(patch.defaultPresentation)
      ? patch.defaultPresentation
      : current.defaultPresentation,
    tags: Array.isArray(patch.tags) ? patch.tags : current.tags,
    planning: {
      ...current.planning,
      ...(patch.planning ?? {}),
    },
    stats: patch.stats ?? current.stats,
    characters: patch.characters ?? current.characters,
    assets: patch.assets ?? current.assets,
    nodes: patch.nodes ?? current.nodes,
    aiJobs: patch.aiJobs ?? current.aiJobs,
  };

  scripts[index] = next;
  await writeScripts(scripts);

  return next;
}

export async function deleteStoredScript(slug: string) {
  const scripts = await readScripts();
  const index = scripts.findIndex((script) => script.slug === slug);

  if (index === -1) {
    return null;
  }

  const [script] = scripts.splice(index, 1);
  await writeScripts(scripts);

  return script;
}

export async function updateStoredNode(
  slug: string,
  nodeId: string,
  patch: Partial<DemoNode>,
) {
  const scripts = await readScripts();
  const scriptIndex = scripts.findIndex((script) => script.slug === slug);

  if (scriptIndex === -1) {
    return null;
  }

  const script = scripts[scriptIndex];
  const nodeIndex = script.nodes.findIndex((node) => node.id === nodeId);

  if (nodeIndex === -1) {
    return null;
  }

  const current = script.nodes[nodeIndex];
  const next: DemoNode = {
    ...current,
    ...patch,
    id: current.id,
    key: current.key,
    characterBindings: patch.characterBindings ?? current.characterBindings,
    statDelta: patch.statDelta ?? current.statDelta,
    dialogues: patch.dialogues ?? current.dialogues,
    choices: patch.choices ?? current.choices,
  };

  script.nodes[nodeIndex] = next;
  scripts[scriptIndex] = script;
  await writeScripts(scripts);

  return next;
}

export type AddStoredAssetInput = {
  type: AssetType;
  key: string;
  name: string;
  fileUrl: string;
  characterId?: string;
  emotion?: string;
  pose?: string;
};

export async function addStoredAsset(slug: string, input: AddStoredAssetInput) {
  const scripts = await readScripts();
  const scriptIndex = scripts.findIndex((script) => script.slug === slug);

  if (scriptIndex === -1) {
    return null;
  }

  const script = scripts[scriptIndex];
  const key = uniqueAssetKey(toSlug(input.key || input.name), script.assets);
  const asset: DemoAsset = {
    id: `asset-${Date.now()}`,
    key,
    name: input.name.trim(),
    type: input.type,
    fileUrl: input.fileUrl.trim(),
    characterId: input.characterId?.trim() || undefined,
    emotion: input.emotion?.trim() || undefined,
    pose: input.pose?.trim() || undefined,
    status: "approved",
  };

  script.assets.push(asset);
  scripts[scriptIndex] = script;
  await writeScripts(scripts);

  return { script, asset };
}

export async function addStoredNode(slug: string, parentNodeId?: string) {
  const scripts = await readScripts();
  const scriptIndex = scripts.findIndex((script) => script.slug === slug);

  if (scriptIndex === -1) {
    return null;
  }

  const script = scripts[scriptIndex];
  const nextIndex = script.nodes.length + 1;
  const background =
    script.assets.find((asset) => asset.type === "background") ??
    script.assets[0];
  const defaultPresentation = getScriptDefaultPresentation(script);
  const firstCharacter = script.characters[0];
  const firstCharacterAsset = script.assets.find(
    (asset) => asset.characterId === firstCharacter?.id,
  );
  const id = `node-${Date.now()}`;

  const node: DemoNode = {
    id,
    key: `node_${nextIndex}`,
    title: `未命名节点 ${nextIndex}`,
    nodeType: "normal",
    chapter: "待定章节",
    summary: "写下这个节点里真正发生的事。",
    goal: "写下你希望这个节点把剧情推向哪里。",
    tone: script.planning.tone || "按你的故事气质填写",
    presentation: defaultPresentation,
    sceneConfig:
      defaultPresentation === "scene"
        ? {
            dialoguePosition: "bottom",
            dialogueVariant: "glass",
            dimBackground: true,
          }
        : undefined,
    chatConfig:
      defaultPresentation === "chat"
        ? {
            appName: "私信",
            contactName: `待定会话 ${nextIndex}`,
            contactStatus: "在线",
            showTyping: false,
          }
        : undefined,
    backgroundAssetId: background?.id ?? "",
    characterBindings:
      firstCharacter && firstCharacterAsset
        ? [
            {
              characterId: firstCharacter.id,
              assetId: firstCharacterAsset.id,
              position: "left",
            },
          ]
        : [],
    statDelta: {},
    narration: "这里写旁白。先不要追求完整，先把场景、动作和玩家要判断的信息放进去。",
    dialogues: firstCharacter
      ? [
          {
            speaker: firstCharacter.key,
            emotion: "calm",
            text: "这里写角色真正会说的话。",
          },
        ]
      : [],
    choices: [],
  };

  script.nodes.push(node);

  if (parentNodeId) {
    const parent = script.nodes.find((item) => item.id === parentNodeId);

    if (parent) {
      const choice: DemoChoice = {
        id: `choice-${Date.now()}`,
        text: `进入${node.title}`,
        description: "从当前节点延展出的新剧情。",
        nextNodeId: node.id,
        statDelta: {},
      };

      parent.choices.push(choice);
    }
  }

  scripts[scriptIndex] = script;
  await writeScripts(scripts);

  return { script, node };
}

export async function deleteStoredNode(slug: string, nodeId: string) {
  const scripts = await readScripts();
  const scriptIndex = scripts.findIndex((script) => script.slug === slug);

  if (scriptIndex === -1) {
    return null;
  }

  const script = scripts[scriptIndex];
  const node = script.nodes.find((item) => item.id === nodeId);

  if (!node || node.nodeType === "start") {
    return null;
  }

  script.nodes = script.nodes
    .filter((item) => item.id !== nodeId)
    .map((item) => ({
      ...item,
      choices: item.choices.filter((choice) => choice.nextNodeId !== nodeId),
    }));

  scripts[scriptIndex] = script;
  await writeScripts(scripts);

  return node;
}

function isDemoCharacter(
  character: DemoCharacter | undefined,
): character is DemoCharacter {
  return Boolean(character);
}

export async function generateStoredNodeDraft(slug: string, nodeId: string) {
  const scripts = await readScripts();
  const scriptIndex = scripts.findIndex((script) => script.slug === slug);

  if (scriptIndex === -1) {
    return null;
  }

  const script = scripts[scriptIndex];
  const nodeIndex = script.nodes.findIndex((node) => node.id === nodeId);

  if (nodeIndex === -1) {
    return null;
  }

  const node = script.nodes[nodeIndex];
  const speakers = node.characterBindings
    .map((binding) =>
      script.characters.find((character) => character.id === binding.characterId),
    )
    .filter(isDemoCharacter);
  const firstSpeaker = speakers[0] ?? script.characters[0];
  const secondSpeaker = speakers[1] ?? script.characters[1] ?? firstSpeaker;
  const choiceHint =
    node.choices.length > 0
      ? `这一刻会导向：${node.choices
          .map((choice) => choice.text)
          .join(" / ")}。`
      : "这一刻暂时没有新的选择，重点是把阶段性结果写清楚。";

  const next: DemoNode = {
    ...node,
    narration: `${node.chapter}里，「${node.title}」发生的是：${node.summary}。这一节点的作者意图是：${node.goal}。节奏和味道保持为：${node.tone}。${choiceHint}`,
    dialogues: [
      {
        speaker: firstSpeaker?.key ?? "heroine",
        emotion: "calm",
        text: `先别急着定稿，我想把「${node.title}」这一段真正要表达的东西说清楚。`,
      },
      {
        speaker: secondSpeaker?.key ?? firstSpeaker?.key ?? "heroine",
        emotion: node.nodeType === "ending" ? "calm" : "tense",
        text:
          node.nodeType === "ending"
            ? "这一段可以收束，但最好留下一个和前面选择有关的余味。"
            : "如果这里要继续推进，就让下一句对白把矛盾、关系或行动往前推一步。",
      },
    ],
  };

  script.nodes[nodeIndex] = next;
  scripts[scriptIndex] = script;
  await writeScripts(scripts);

  return next;
}
