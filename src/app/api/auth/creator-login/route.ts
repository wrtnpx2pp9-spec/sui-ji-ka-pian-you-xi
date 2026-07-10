import { NextResponse } from "next/server";
import {
  findCreatorByInviteCode,
  setCreatorSessionCookie,
} from "@/lib/creator-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const inviteCode = typeof body.inviteCode === "string" ? body.inviteCode : "";
  const creator = await findCreatorByInviteCode(inviteCode);

  if (!creator) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 401 });
  }

  await setCreatorSessionCookie({
    id: creator.id,
    displayName: creator.displayName,
    role: creator.role,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: creator.id,
      displayName: creator.displayName,
      role: creator.role,
    },
  });
}
