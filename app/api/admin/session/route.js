import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: true, authenticated: false });
  }
  let storage = { driver: "unknown", writable: false, persistent: false };
  try {
    storage = await db.info();
  } catch {}
  return NextResponse.json({
    success: true,
    authenticated: true,
    storage,
  });
}
