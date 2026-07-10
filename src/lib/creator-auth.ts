import { createHash, createHmac, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { CREATOR_SESSION_COOKIE } from "@/lib/auth-shared";
import type { CreatorRole, CreatorUser, DemoScript } from "@/lib/types";

const dataDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const creatorsFile = path.join(dataDir, "creators.json");
const defaultSecret = "miaomi-dev-session-secret";

export type CreatorSession = {
  id: string;
  displayName: string;
  role: CreatorRole;
};

function getSessionSecret() {
  return process.env.MIAOMI_SESSION_SECRET || defaultSecret;
}

function hashInviteCode(value: string) {
  return createHash("sha256").update(value.trim()).digest("hex");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function encodeSession(session: CreatorSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payload}.${signPayload(payload)}`;
}

function decodeSession(value: string): CreatorSession | null {
  const [payload, signature] = value.split(".");

  if (!payload || !signature || !safeEqual(signature, signPayload(payload))) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<CreatorSession>;

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.displayName !== "string" ||
      (parsed.role !== "creator" && parsed.role !== "admin")
    ) {
      return null;
    }

    return {
      id: parsed.id,
      displayName: parsed.displayName,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function readCreators(): Promise<CreatorUser[]> {
  const raw = await fs.readFile(creatorsFile, "utf8");
  return JSON.parse(raw) as CreatorUser[];
}

export async function findCreatorByInviteCode(inviteCode: string) {
  const inviteCodeHash = hashInviteCode(inviteCode);
  const creators = await readCreators();
  return creators.find(
    (creator) =>
      creator.status === "active" && creator.inviteCodeHash === inviteCodeHash,
  );
}

export async function getCreatorSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CREATOR_SESSION_COOKIE)?.value;
  return raw ? decodeSession(raw) : null;
}

export async function setCreatorSessionCookie(session: CreatorSession) {
  const cookieStore = await cookies();
  cookieStore.set(CREATOR_SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearCreatorSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CREATOR_SESSION_COOKIE);
}

export function canEditScript(session: CreatorSession | null, script: DemoScript) {
  if (!session) {
    return false;
  }

  return session.role === "admin" || script.ownerId === session.id;
}

export function canReview(session: CreatorSession | null) {
  return session?.role === "admin";
}

export function assertCanEditScript(
  session: CreatorSession | null,
  script: DemoScript,
) {
  if (!canEditScript(session, script)) {
    throw new Error("Forbidden");
  }
}

export function assertCanReview(session: CreatorSession | null) {
  if (!canReview(session)) {
    throw new Error("Forbidden");
  }
}
