import { NextResponse } from "next/server";
import {
  passwordMatches,
  setSessionCookie,
  clientIp,
  isLockedOut,
  registerFailure,
  clearFailures,
} from "@/lib/auth";
import { readJson } from "@/lib/api";

export async function POST(request) {
  const ip = clientIp(request);
  if (isLockedOut(ip)) {
    return NextResponse.json(
      { success: false, error: "Слишком много попыток. Попробуйте через 15 минут.", code: "LOCKED" },
      { status: 429 }
    );
  }
  const body = await readJson(request);
  const password = String(body?.password ?? "");

  if (password && passwordMatches(password)) {
    clearFailures(ip);
    return setSessionCookie(NextResponse.json({ success: true }), request);
  }
  registerFailure(ip);
  return NextResponse.json({ success: false, error: "Неверный пароль", code: "BAD_PASSWORD" }, { status: 401 });
}
