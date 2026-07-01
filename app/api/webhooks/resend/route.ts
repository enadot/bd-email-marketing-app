import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyResendSignature } from "@/lib/resend-webhook";

// Maps Resend event types to SendLog updates.
const EVENT_MAP: Record<
  string,
  { status?: string; field?: "openedAt" | "clickedAt" | "bouncedAt" }
> = {
  "email.delivered": { status: "delivered" },
  "email.opened": { status: "opened", field: "openedAt" },
  "email.clicked": { status: "clicked", field: "clickedAt" },
  "email.bounced": { status: "bounced", field: "bouncedAt" },
  "email.complained": { status: "complained" },
};

export async function POST(request: NextRequest) {
  const payload = await request.text();

  const valid = verifyResendSignature(
    payload,
    {
      id: request.headers.get("svix-id"),
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature"),
    },
    process.env.RESEND_WEBHOOK_SECRET,
  );
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: { email_id?: string } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const mapping = event.type ? EVENT_MAP[event.type] : undefined;
  const messageId = event.data?.email_id;
  if (!mapping || !messageId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Find the matching send log by Resend message id.
  const log = await prisma.sendLog.findFirst({
    where: { resendMessageId: messageId },
    select: { id: true },
  });
  if (!log) return NextResponse.json({ ok: true, unmatched: true });

  await prisma.sendLog.update({
    where: { id: log.id },
    data: {
      ...(mapping.status ? { status: mapping.status as never } : {}),
      ...(mapping.field ? { [mapping.field]: new Date() } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
