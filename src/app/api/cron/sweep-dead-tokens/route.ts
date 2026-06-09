import { NextResponse } from "next/server";
import { sweepDeadTokenCandidates } from "@/lib/dead-token-sweeper";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    100,
    Math.max(10, Number(new URL(request.url).searchParams.get("limit") ?? 40)),
  );

  try {
    const result = await sweepDeadTokenCandidates(limit);
    return NextResponse.json({
      ok: true,
      persisted: result.persisted,
      upserted: result.upserted,
      candidates: result.candidates.length,
      sweptAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Dead-token sweep failed" },
      { status: 500 },
    );
  }
}
