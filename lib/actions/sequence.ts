"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";
import { emptyDocument, emailDocumentSchema, type EmailDocument } from "@/lib/blocks/schema";

// Creates an empty manual sequence with one starter step, then opens the editor.
export async function createManualSequence(formData: FormData) {
  const { org } = await requireOrg();
  const name = String(formData.get("name") ?? "").trim() || "סדרה חדשה";

  const seq = await prisma.sequence.create({
    data: {
      orgId: org.id,
      name,
      status: "draft",
      steps: {
        create: {
          order: 0,
          delayValue: 0,
          delayUnit: "days",
          subject: "מייל ראשון",
          blocks: emptyDocument,
        },
      },
    },
  });

  redirect(`/sequences/${seq.id}`);
}

export async function updateSequenceMeta(input: {
  id: string;
  name?: string;
  status?: "draft" | "active" | "paused" | "archived";
}) {
  const { org } = await requireOrg();
  await prisma.sequence.update({
    where: { id: input.id, orgId: org.id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() || "סדרה" } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });
  revalidatePath(`/sequences/${input.id}`);
  return { ok: true };
}

export async function addStep(sequenceId: string) {
  const { org } = await requireOrg();
  const seq = await prisma.sequence.findFirst({
    where: { id: sequenceId, orgId: org.id },
    include: { steps: { orderBy: { order: "desc" }, take: 1 } },
  });
  if (!seq) return { ok: false };

  const nextOrder = (seq.steps[0]?.order ?? -1) + 1;
  await prisma.sequenceStep.create({
    data: {
      sequenceId,
      order: nextOrder,
      delayValue: 2,
      delayUnit: "days",
      subject: `מייל ${nextOrder + 1}`,
      blocks: emptyDocument,
    },
  });
  revalidatePath(`/sequences/${sequenceId}`);
  return { ok: true };
}

// Saves a single step's content + metadata (ownership enforced through the parent org).
export async function saveStep(input: {
  id: string;
  sequenceId: string;
  subject: string;
  preheader?: string;
  delayValue: number;
  delayUnit: "minutes" | "hours" | "days";
  conditions?: unknown;
  doc: EmailDocument;
}) {
  const { org } = await requireOrg();
  // Verify the step belongs to a sequence in this org.
  const step = await prisma.sequenceStep.findFirst({
    where: { id: input.id, sequence: { orgId: org.id } },
    select: { id: true },
  });
  if (!step) return { ok: false, error: "not found" };

  const doc = emailDocumentSchema.parse(input.doc);
  await prisma.sequenceStep.update({
    where: { id: input.id },
    data: {
      subject: input.subject.trim() || "ללא נושא",
      preheader: input.preheader?.trim() || null,
      delayValue: input.delayValue,
      delayUnit: input.delayUnit,
      conditions: (input.conditions ?? undefined) as object | undefined,
      blocks: doc,
    },
  });
  revalidatePath(`/sequences/${input.sequenceId}`);
  return { ok: true };
}

export async function deleteStep(input: { id: string; sequenceId: string }) {
  const { org } = await requireOrg();
  await prisma.sequenceStep.deleteMany({
    where: { id: input.id, sequence: { orgId: org.id } },
  });
  revalidatePath(`/sequences/${input.sequenceId}`);
  return { ok: true };
}

export async function deleteSequence(id: string) {
  const { org } = await requireOrg();
  await prisma.sequence.deleteMany({ where: { id, orgId: org.id } });
  redirect("/sequences");
}
