import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);

// Routes that need protection (dashboard and any future admin sub-pages)
const PROTECTED_ADMIN_PATHS = ["/admin/dashboard"];
// The login page itself — redirect to dashboard if already logged in
const LOGIN_PAGE = "/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname === LOGIN_PAGE;

  const token = req.cookies.get("admin_token")?.value;

  // ── Verify JWT ──────────────────────────────────────────────────────────────
  let isValidSession = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValidSession = true;
    } catch {
      // Token invalid or expired
      isValidSession = false;
    }
  }

  // ── Guard: redirect to login if no valid session ───────────────────────────
  if (isProtected && !isValidSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin";
    return NextResponse.redirect(loginUrl);
  }

  // ── Convenience: redirect to dashboard if already logged in ───────────────
  if (isLoginPage && isValidSession) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on admin routes
  matcher: ["/admin", "/admin/:path*"],
};