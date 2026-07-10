import { cookies } from "next/headers";
import type { DemoScript } from "@/lib/types";
import {
  getScriptUnlockCookie,
  PLAYER_AUTH_COOKIE,
  PLAYER_AUTH_VALUE,
} from "./auth-shared";

const DEV_ACCESS_KEY = "dev-access-key";

export function getConfiguredPlayerKey() {
  return (
    process.env.PLAYER_ACCESS_KEY ??
    process.env.MIAOMI_PLAYER_KEY ??
    (process.env.NODE_ENV === "production" ? "" : DEV_ACCESS_KEY)
  );
}

export function isValidPlayerKey(key: string) {
  const configuredKey = getConfiguredPlayerKey();
  return configuredKey.length > 0 && key === configuredKey;
}

export async function isPlayerAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(PLAYER_AUTH_COOKIE)?.value === PLAYER_AUTH_VALUE;
}

export function scriptRequiresPassword(script: DemoScript) {
  return Boolean(script.accessPassword?.trim());
}

export async function isScriptUnlocked(script: DemoScript) {
  if (!scriptRequiresPassword(script)) {
    return true;
  }

  const cookieStore = await cookies();
  return cookieStore.get(getScriptUnlockCookie(script.slug))?.value === "ok";
}

export function isValidScriptPassword(script: DemoScript, password: string) {
  if (!scriptRequiresPassword(script)) {
    return true;
  }

  return password === script.accessPassword;
}

export function stripScriptSecrets(script: DemoScript): DemoScript {
  const safeScript = { ...script };
  delete safeScript.accessPassword;
  return safeScript;
}
