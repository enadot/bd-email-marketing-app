"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";
import { delayToMs } from "@/lib/scheduler";

// Enrolls contacts into a sequence and activates it. Optionally filter by tag.
export async function enrollContacts(input: { sequenceId: string; tagId?: string }) {
  const { org } = await requireOrg();

  const sequence = await prisma.sequence.findFirst({
    where: { id: input.sequenceId, orgId: org.id },
    include: { steps: { orderBy: { order: "asc" }, take: 1 } },
  });
  if (!sequence) return { ok: false, error: "סדרה לא נמצאה" };
  const firstStep = sequence.steps[0];
  if (!firstStep) return { ok: false, error: "אין מיילים בסדרה" };

  const contacts = await prisma.contact.findMany({
    where: {
      orgId: org.id,
      subscribed: true,
      ...(input.tagId ? { tags: { some: { tagId: input.tagId } } } : {}),
    },
    select: { id: true },
  });

  const firstRunAt = new Date(
    Date.now() + delayToMs(firstStep.delayValue, firstStep.delayUnit),
  );

  let enrolled = 0;
  for (const c of contacts) {
    const existing = await prisma.enrollment.findUnique({
      where: { sequenceId_contactId: { sequenceId: sequence.id, contactId: c.id } },
    });
    if (existing) continue; // don't re-enroll
    await prisma.enrollment.create({
      data: {
        sequenceId: sequence.id,
        contactId: c.id,
        currentStep: firstStep.order,
        status: "active",
        nextRunAt: firstRunAt,
      },
    });
    enrolled += 1;
  }

  // Activate the sequence so the scheduler starts sending.
  await prisma.sequence.update({
    where: { id: sequence.id },
    data: { status: "active" },
  });

  revalidatePath(`/sequences/${sequence.id}`);
  return { ok: true, enrolled };
}
