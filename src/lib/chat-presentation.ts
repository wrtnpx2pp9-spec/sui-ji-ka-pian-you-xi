import type {
  ChatDeliveryStatus,
  ChatMessageKind,
  ChatMessageSide,
  ChatNodeConfig,
  DemoScript,
  DialogueLine,
} from "./types";

export const chatSideOptions: Array<{
  value: ChatMessageSide;
  label: string;
}> = [
  { value: "incoming", label: "对方消息" },
  { value: "outgoing", label: "玩家消息" },
  { value: "system", label: "系统提示" },
];

export const chatKindOptions: Array<{
  value: ChatMessageKind;
  label: string;
}> = [
  { value: "text", label: "文本气泡" },
  { value: "image", label: "图片/证据" },
  { value: "notice", label: "提示条" },
];

export const chatDeliveryOptions: Array<{
  value: ChatDeliveryStatus;
  label: string;
}> = [
  { value: "hidden", label: "不显示" },
  { value: "sent", label: "已发送" },
  { value: "delivered", label: "已送达" },
  { value: "read", label: "已读" },
];

export function getChatConfig(title: string, config?: ChatNodeConfig) {
  return {
    appName: config?.appName ?? "私信",
    contactName: config?.contactName ?? title,
    contactStatus: config?.contactStatus ?? "在线",
    safetyHint:
      config?.safetyHint ??
      "模拟对话：遇到索要隐私、转账、威胁曝光时，优先留证、拒绝、举报和求助。",
    showTyping: config?.showTyping ?? false,
    typingLabel: config?.typingLabel ?? "对方正在输入...",
  };
}

export function getChatSide(line: DialogueLine, script: DemoScript) {
  if (line.chatSide) {
    return line.chatSide;
  }

  const character = script.characters.find(
    (item) => item.key === line.speaker || item.id === line.speaker,
  );

  if (line.speaker === "player" || character?.roleType === "protagonist") {
    return "outgoing";
  }

  return "incoming";
}

export function getChatKind(line: DialogueLine): ChatMessageKind {
  return line.chatKind ?? "text";
}

export function getChatDelivery(line: DialogueLine): ChatDeliveryStatus {
  return line.deliveryStatus ?? "hidden";
}
