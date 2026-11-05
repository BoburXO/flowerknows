import crypto from "crypto";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "fk_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Admin password. Default: omina_rania. Override on the server with ADMIN_PASSWORD.
function adminPassword() {
  return String(process.env.ADMIN_PASSWORD || "omina_rania");
}

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    crypto.createHash("sha256").update("fk-session:" + adminPassword()).digest("hex")
  );
}

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();

export function passwordMatches(input) {
  return crypto.timingSafeEqual(sha(String(input ?? "").trim()), sha(adminPassword()));
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken() {
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  return `${expires}.${sign(expires)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  const expected = sign(expires);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(expires) > Date.now();
}

export function isAdmin(request) {
  return verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

/** Returns a 401 response when not logged in, otherwise null. */
export function requireAdmin(request) {
  if (isAdmin(request)) return null;
  return NextResponse.json(
    { success: false, error: "Требуется вход в админ-панель", code: "UNAUTHORIZED" },
    { status: 401 }
  );
}

export function setSessionCookie(response, request) {
  const secure =
    request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response) {
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}

/* --- very small in-memory brute-force guard for the admin password --- */
const attempts = new Map(); // ip -> { count, first }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : request.headers.get("x-real-ip")) || "unknown";
}

export function isLockedOut(ip) {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

export function registerFailure(ip) {
  const rec = attempts.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) attempts.set(ip, { count: 1, first: Date.now() });
  else rec.count += 1;
}

export function clearFailures(ip) {
  attempts.delete(ip);
}
