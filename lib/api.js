import { NextResponse } from "next/server";
import { StorageError } from "@/lib/db";

export const ok = (data, init = {}) =>
  NextResponse.json({ success: true, ...(data !== undefined ? { data } : {}), ...(init.extra || {}) }, { status: init.status || 200 });

export const fail = (error, status = 400, extra = {}) =>
  NextResponse.json({ success: false, error, ...extra }, { status });

/** Converts any thrown error into a JSON response. Storage problems are shown honestly (503), never as success. */
export function handleError(err, fallback = "Внутренняя ошибка сервера") {
  if (err instanceof StorageError) {
    console.error("[storage]", err.code, err.message);
    return fail(err.message, 503, { code: err.code });
  }
  console.error(err);
  return fail(fallback, 500);
}

export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return null;
  }
}
