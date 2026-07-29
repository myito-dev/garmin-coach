import { NextResponse } from "next/server";
import { clearGarminSession } from "@/lib/store";

export async function POST() {
  await clearGarminSession();
  return NextResponse.json({ ok: true });
}
