import { NextResponse } from "next/server";
import { isValidPlayerKey } from "@/lib/auth";
import { PLAYER_AUTH_COOKIE, PLAYER_AUTH_VALUE } from "@/lib/auth-shared";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const key = typeof body.key === "string" ? body.key : "";

  if (!isValidPlayerKey(key)) {
    return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(PLAYER_AUTH_COOKIE, PLAYER_AUTH_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
