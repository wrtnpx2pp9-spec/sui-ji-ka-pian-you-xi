import { NextResponse } from "next/server";
import { isValidScriptPassword } from "@/lib/auth";
import { getScriptUnlockCookie } from "@/lib/auth-shared";
import { getStoredScriptBySlug } from "@/lib/script-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const script = await getStoredScriptBySlug(slug);

  if (!script || script.status !== "published") {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidScriptPassword(script, password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(getScriptUnlockCookie(script.slug), "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
