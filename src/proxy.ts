import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CREATOR_SESSION_COOKIE,
  isSafeNextPath,
  PLAYER_AUTH_COOKIE,
  PLAYER_AUTH_VALUE,
} from "@/lib/auth-shared";

export function proxy(request: NextRequest) {
  const isStudioPath = request.nextUrl.pathname.startsWith("/studio");
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isCreatorApiPath =
    request.nextUrl.pathname.startsWith("/api/studio") ||
    request.nextUrl.pathname.startsWith("/api/admin");
  const isStudioLoginPath = request.nextUrl.pathname === "/studio/login";
  const hasCreatorSession = Boolean(
    request.cookies.get(CREATOR_SESSION_COOKIE)?.value,
  );

  if (
    (isStudioPath && !isStudioLoginPath) ||
    isAdminPath ||
    isCreatorApiPath
  ) {
    if (hasCreatorSession) {
      return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/studio/login", request.url);
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    if (isSafeNextPath(nextPath)) {
      loginUrl.searchParams.set("next", nextPath);
    }

    return NextResponse.redirect(loginUrl);
  }

  const isAuthenticated =
    request.cookies.get(PLAYER_AUTH_COOKIE)?.value === PLAYER_AUTH_VALUE;

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (isSafeNextPath(nextPath)) {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/studio/:path*",
    "/api/admin/:path*",
    "/api/studio/:path*",
  ],
};
