import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { COOKIE_NAME, expectedCookieValue } from "@/proxy";

export async function POST(request: NextRequest) {
  const expected = expectedCookieValue();
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  const ok =
    expected !== null &&
    password.length > 0 &&
    crypto.timingSafeEqual(
      Buffer.from(crypto.createHash("sha256").update(password).digest("hex")),
      Buffer.from(expected)
    );

  if (!ok) {
    return NextResponse.redirect(new URL("/?error=1", request.url), { status: 303 });
  }

  const res = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  res.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
