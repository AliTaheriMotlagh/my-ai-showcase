import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for pages that need an account. It only checks that a session cookie is present, so
 * logged-out visitors get a real 307 to /login. Each page still validates the session on the server.
 */
const PROTECTED = ["/create", "/settings", "/notifications", "/me"];
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPath = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!protectedPath) return NextResponse.next();

  const signedIn = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (signedIn) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/create", "/create/:path*", "/settings", "/settings/:path*", "/notifications", "/notifications/:path*", "/me"],
};
