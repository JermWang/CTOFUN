import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { collectPumpCreatorFees } from "@/lib/pumpportal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!expected || !authHeader || !secretsMatch(authHeader, `Bearer ${expected}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await collectPumpCreatorFees();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Creator-fee collection failed" },
      { status: 500 },
    );
  }
}
