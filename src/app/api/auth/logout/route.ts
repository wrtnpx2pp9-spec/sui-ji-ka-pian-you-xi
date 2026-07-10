import { NextResponse } from "next/server";
import { getScriptUnlockCookie, PLAYER_AUTH_COOKIE } from "@/lib/auth-shared";
import { readScripts } from "@/lib/script-store";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const scripts = await readScripts();

  response.cookies.set(PLAYER_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  for (const script of scripts) {
    response.cookies.set(getScriptUnlockCookie(script.slug), "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}
