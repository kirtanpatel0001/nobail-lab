import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Store these in your .env.local — NEVER hardcode real creds in production!
const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
const SESSION_DURATION = "8h"; // Auto-expire after 8 hours

// Rate limiting: simple in-memory store (use Redis in production)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const now = Date.now();

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const attempt = loginAttempts.get(ip);
  if (attempt) {
    if (attempt.lockedUntil > now) {
      const remainingMin = Math.ceil((attempt.lockedUntil - now) / 60000);
      return NextResponse.json(
        { success: false, message: `Too many attempts. Try again in ${remainingMin} min.` },
        { status: 429 }
      );
    }
    if (attempt.count >= MAX_ATTEMPTS) {
      loginAttempts.set(ip, { count: attempt.count, lockedUntil: now + LOCKOUT_MS });
      return NextResponse.json(
        { success: false, message: "Account locked for 15 minutes due to too many failed attempts." },
        { status: 429 }
      );
    }
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let username: string, password: string;
  try {
    ({ username, password } = await req.json());
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ success: false, message: "All fields required." }, { status: 400 });
  }

  // ── Validate credentials ───────────────────────────────────────────────────
  // Constant-time comparison to prevent timing attacks
  const usernameMatch = timingSafeEqual(username, ADMIN_USERNAME);
  const passwordMatch = timingSafeEqual(password, ADMIN_PASSWORD);

  if (!usernameMatch || !passwordMatch) {
    const current = loginAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };
    loginAttempts.set(ip, { count: current.count + 1, lockedUntil: 0 });

    console.warn(`[ADMIN] Failed login attempt from IP: ${ip} at ${new Date().toISOString()}`);

    // Return generic error (don't reveal which field was wrong)
    return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });
  }

  // ── Success — reset rate limit, issue JWT ──────────────────────────────────
  loginAttempts.delete(ip);

  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(JWT_SECRET);

  console.info(`[ADMIN] Successful login from IP: ${ip} at ${new Date().toISOString()}`);

  const response = NextResponse.json({ success: true });

  // httpOnly = JS cannot read this cookie (XSS safe)
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours in seconds
  });

  return response;
}

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}