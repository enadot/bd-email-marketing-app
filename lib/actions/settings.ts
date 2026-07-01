"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";

// Updates org sending settings. The Resend key is encrypted at rest; an empty
// value leaves the existing key untouched.
export async function updateOrgSettings(formData: FormData) {
  const { org } = await requireOrg();
  const sendingDomain = String(formData.get("sendingDomain") ?? "").trim() || null;
  const rawKey = String(formData.get("resendApiKey") ?? "").trim();

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      sendingDomain,
      ...(rawKey ? { resendApiKey: encryptSecret(rawKey) } : {}),
    },
  });
  revalidatePath("/settings");
}

// Creates an inbound-contacts integration with a fresh signing secret.
export async function createIntegration(formData: FormData) {
  const { org } = await requireOrg();
  const name = String(formData.get("name") ?? "").trim() || "אינטגרציה";
  const secret = crypto.randomBytes(24).toString("hex");

  await prisma.integration.create({
    data: { orgId: org.id, type: "webhook", name, secret },
  });
  revalidatePath("/settings");
}

export async function deleteIntegration(id: string) {
  const { org } = await requireOrg();
  await prisma.integration.deleteMany({ where: { id, orgId: org.id } });
  revalidatePath("/settings");
  return { ok: true };
}
