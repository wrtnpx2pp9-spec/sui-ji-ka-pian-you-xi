export type ScriptStatus =
  | "draft"
  | "ai_generating"
  | "editing"
  | "testing"
  | "review"
  | "published"
  | "archived";

export type CreatorRole = "creator" | "admin";

export type CreatorStatus = "active" | "disabled";

export type AssetType =
  | "cover"
  | "background"
  | "character"
  | "expression"
  | "pose"
  | "prop"
  | "ui";

export type CharacterRoleType =
  | "protagonist"
  | "ally"
  | "risk_object"
  | "family"
  | "authority"
  | "side"
  | "system";

export type NodeType = "start" | "normal" | "event" | "choice" | "ending";

export type NodePresentation = "scene" | "chat";

export type SceneDialoguePosition = "top" | "middle" | "bottom";

export type SceneDialogueVariant = "glass" | "solid";

export type ChatMessageSide = "incoming" | "outgoing" | "system";

export type ChatMessageKind = "text" | "image" | "notice";

export type ChatDeliveryStatus = "hidden" | "sent" | "delivered" | "read";

export type ChatNodeConfig = {
  appName?: string;
  contactName?: string;
  contactStatus?: string;
  safetyHint?: string;
  showTyping?: boolean;
  typingLabel?: string;
  allowFreeReply?: boolean;
  responderCharacterId?: string;
  freeReplyPlaceholder?: string;
};

export type SceneNodeConfig = {
  dialoguePosition?: SceneDialoguePosition;
  dialogueVariant?: SceneDialogueVariant;
  dimBackground?: boolean;
};

export type DialogueLine = {
  speaker: string;
  emotion: string;
  text: string;
  chatSide?: ChatMessageSide;
  chatKind?: ChatMessageKind;
  assetId?: string;
  timestamp?: string;
  deliveryStatus?: ChatDeliveryStatus;
};

export type CharacterBinding = {
  characterId: string;
  assetId: string;
  position: "left" | "right" | "center";
};

export type DemoAsset = {
  id: string;
  key: string;
  name: string;
  type: AssetType;
  fileUrl: string;
  characterId?: string;
  emotion?: string;
  pose?: string;
  status: "draft" | "generating" | "needs_review" | "approved" | "rejected";
};

export type DemoCharacter = {
  id: string;
  key: string;
  name: string;
  roleType: CharacterRoleType;
  description: string;
  personality: string;
  narrativeFunction: string;
  defaultAssetId: string;
  aiProfile?: {
    systemPrompt?: string;
    replyStyle?: string;
    temperature?: number;
  };
};

export type DemoChoice = {
  id: string;
  text: string;
  description: string;
  nextNodeId: string;
  statDelta: Record<string, number>;
  isKeyChoice?: boolean;
};

export type DemoNode = {
  id: string;
  key: string;
  title: string;
  nodeType: NodeType;
  chapter: string;
  summary: string;
  goal: string;
  tone: string;
  presentation?: NodePresentation;
  sceneConfig?: SceneNodeConfig;
  chatConfig?: ChatNodeConfig;
  backgroundAssetId: string;
  characterBindings: CharacterBinding[];
  statDelta: Record<string, number>;
  narration: string;
  dialogues: DialogueLine[];
  choices: DemoChoice[];
};

export type DemoStat = {
  key: string;
  name: string;
  description: string;
  initialValue: number;
  visible: boolean;
};

export type DemoAiJob = {
  id: string;
  jobType: string;
  status: "pending" | "running" | "completed" | "failed" | "applied";
  title: string;
  description: string;
  outputPreview: string;
};

export type CreatorUser = {
  id: string;
  displayName: string;
  role: CreatorRole;
  status: CreatorStatus;
  inviteCodeHash: string;
  createdAt: string;
};

export type DemoScript = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  theme: string;
  style: string;
  tags: string[];
  targetAudience: string;
  contentWarning: string;
  accessPassword?: string;
  ownerId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  defaultPresentation?: NodePresentation;
  status: ScriptStatus;
  estimatedMinutes: number;
  planning: {
    logline: string;
    playerGoal: string;
    mainConflict: string;
    tone: string;
    safetyBoundary: string;
  };
  stats: DemoStat[];
  characters: DemoCharacter[];
  assets: DemoAsset[];
  nodes: DemoNode[];
  aiJobs: DemoAiJob[];
};
