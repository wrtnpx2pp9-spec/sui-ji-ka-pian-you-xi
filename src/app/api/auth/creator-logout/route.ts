import { NextResponse } from "next/server";
import { clearCreatorSessionCookie } from "@/lib/creator-auth";

export async function POST() {
  await clearCreatorSessionCookie();
  return NextResponse.json({ ok: true });
}
