import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic auth gate for /app and /admin.
 * Real authorization still happens in each page via auth.api.getSession().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const needsAuth =
    pathname.startsWith("/app") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/choose-plan") ||
    pathname.startsWith("/checkout");

  if (needsAuth) {
    if (!sessionCookie) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  if (
    sessionCookie &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/admin/:path*",
    "/choose-plan",
    "/checkout",
    "/checkout/:path*",
    "/login",
    "/signup",
  ],
};
