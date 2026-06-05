import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEV_AUTH_COOKIE = "vellor_dev_auth";
const DEV_PASSWORD = process.env.DEV_PASSWORD || "vellor2024";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || password !== DEV_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const redirectTo = body.from || "/";
  const response = NextResponse.json({ ok: true, redirectTo });

  // Set cookie valid for 7 days
  response.cookies.set(DEV_AUTH_COOKIE, DEV_PASSWORD, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    // Only secure on production (https)
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
