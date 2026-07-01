import { NextResponse, type NextRequest } from "next/server";
import { processDueEnrollments } from "@/lib/scheduler";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Runs the sequence scheduler. Secured by CRON_SECRET (Vercel Cron sends it as a
// Bearer token; manual calls may pass ?secret=).
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // allow in local dev when unset
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await processDueEnrollments();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
