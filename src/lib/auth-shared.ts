export const PLAYER_AUTH_COOKIE = "miaomi_player_auth";
export const PLAYER_AUTH_VALUE = "ok";
export const CREATOR_SESSION_COOKIE = "miaomi_creator_session";

export function getScriptUnlockCookie(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `miaomi_script_${safeSlug}_unlock`;
}

export function isSafeNextPath(
  path: string | null | undefined,
): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}
