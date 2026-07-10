export type ModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ModelRequest = {
  messages: ModelMessage[];
  temperature?: number;
};

function extractText(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as {
    text?: unknown;
    content?: unknown;
    message?: unknown;
    reply?: unknown;
    choices?: unknown;
  };

  if (typeof data.text === "string") {
    return data.text;
  }

  if (typeof data.content === "string") {
    return data.content;
  }

  if (typeof data.reply === "string") {
    return data.reply;
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  if (Array.isArray(data.choices)) {
    const first = data.choices[0] as
      | { message?: { content?: unknown }; text?: unknown }
      | undefined;

    if (typeof first?.message?.content === "string") {
      return first.message.content;
    }

    if (typeof first?.text === "string") {
      return first.text;
    }
  }

  return null;
}

export async function callConfiguredModel(request: ModelRequest) {
  const endpoint = process.env.MODEL_API_URL;

  if (!endpoint) {
    return null;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MODEL_API_KEY
        ? { Authorization: `Bearer ${process.env.MODEL_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      messages: request.messages,
      temperature: request.temperature ?? 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error("Model API request failed");
  }

  const data = (await response.json()) as unknown;
  return extractText(data);
}
