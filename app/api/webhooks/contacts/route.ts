import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Inbound contacts from external sources (forms / CRM). Each org creates an
// Integration with a secret; callers pass ?integration=<id> and the secret in
// the X-Webhook-Secret header (or `secret` in the body).
export async function POST(request: NextRequest) {
  const integrationId = request.nextUrl.searchParams.get("integration");
  if (!integrationId) {
    return NextResponse.json({ error: "missing integration" }, { status: 400 });
  }

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });
  if (!integration) {
    return NextResponse.json({ error: "unknown integration" }, { status: 404 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const provided = request.headers.get("x-webhook-secret") ?? String(body.secret ?? "");
  if (provided !== integration.secret) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 422 });
  }

  const firstName = body.firstName ? String(body.firstName) : null;
  const lastName = body.lastName ? String(body.lastName) : null;
  const fields = (
    body.fields && typeof body.fields === "object" ? body.fields : {}
  ) as Prisma.InputJsonValue;

  await prisma.contact.upsert({
    where: { orgId_email: { orgId: integration.orgId, email } },
    update: { firstName, lastName, fields, source: "webhook" },
    create: { orgId: integration.orgId, email, firstName, lastName, fields, source: "webhook" },
  });

  return NextResponse.json({ ok: true });
}
