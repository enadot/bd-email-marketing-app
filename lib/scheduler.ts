import "server-only";
import { prisma } from "@/lib/prisma";
import { getResend, fromAddress } from "@/lib/resend";
import { renderEmail } from "@/lib/email/render";
import { emailDocumentSchema } from "@/lib/blocks/schema";
import { contactMergeData } from "@/lib/blocks/merge";
import { unsubscribeUrl } from "@/lib/unsubscribe";

type DelayUnit = "minutes" | "hours" | "days";

export function delayToMs(value: number, unit: DelayUnit): number {
  const m = 60 * 1000;
  if (unit === "minutes") return value * m;
  if (unit === "hours") return value * 60 * m;
  return value * 24 * 60 * m;
}

type SkipCondition = { skipIf?: { event: "opened" | "clicked"; step: "previous" } };

// Was the previous step opened/clicked by this enrollment?
async function previousEngaged(
  enrollmentId: string,
  previousStepId: string,
  event: "opened" | "clicked",
): Promise<boolean> {
  const log = await prisma.sendLog.findFirst({
    where: { enrollmentId, stepId: previousStepId },
    orderBy: { createdAt: "desc" },
  });
  if (!log) return false;
  return event === "opened"
    ? log.openedAt != null || log.clickedAt != null
    : log.clickedAt != null;
}

// Processes all enrollments whose next step is due. Returns a summary.
export async function processDueEnrollments(limit = 50) {
  const now = new Date();
  const due = await prisma.enrollment.findMany({
    where: { status: "active", nextRunAt: { lte: now } },
    take: limit,
    include: {
      contact: true,
      sequence: { include: { org: true, steps: { orderBy: { order: "asc" } } } },
    },
  });

  let sent = 0;
  let skipped = 0;
  let completed = 0;
  let failed = 0;

  for (const enr of due) {
    const steps = enr.sequence.steps;
    const step = steps.find((s) => s.order === enr.currentStep);

    // No step at this position → sequence is finished.
    if (!step) {
      await prisma.enrollment.update({
        where: { id: enr.id },
        data: { status: "completed", nextRunAt: null },
      });
      completed += 1;
      continue;
    }

    // Skip & stop for unsubscribed contacts.
    if (!enr.contact.subscribed) {
      await prisma.enrollment.update({
        where: { id: enr.id },
        data: { status: "unsubscribed", nextRunAt: null },
      });
      continue;
    }

    // Evaluate skip condition against the previous step.
    const cond = (step.conditions as SkipCondition) ?? {};
    let doSkip = false;
    if (cond.skipIf && enr.currentStep > 0) {
      const prev = steps.find((s) => s.order === enr.currentStep - 1);
      if (prev) {
        doSkip = await previousEngaged(enr.id, prev.id, cond.skipIf.event);
      }
    }

    if (!doSkip) {
      try {
        const doc = emailDocumentSchema.parse(step.blocks);
        const data = contactMergeData(enr.contact);
        const { html, text } = await renderEmail(doc, data, unsubscribeUrl(enr.contact.id));
        const resend = getResend(enr.sequence.org);
        const unsub = unsubscribeUrl(enr.contact.id);

        const res = await resend.emails.send({
          from: fromAddress(enr.sequence.org),
          to: enr.contact.email,
          subject: step.subject,
          html,
          text,
          headers: {
            "List-Unsubscribe": `<${unsub}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        await prisma.sendLog.create({
          data: {
            enrollmentId: enr.id,
            stepId: step.id,
            resendMessageId: res.data?.id ?? null,
            status: res.error ? "failed" : "sent",
            error: res.error?.message ?? null,
          },
        });
        if (res.error) failed += 1;
        else sent += 1;
      } catch (e) {
        await prisma.sendLog.create({
          data: {
            enrollmentId: enr.id,
            stepId: step.id,
            status: "failed",
            error: e instanceof Error ? e.message : "render/send error",
          },
        });
        failed += 1;
      }
    } else {
      skipped += 1;
    }

    // Advance to the next step (or complete).
    const next = steps.find((s) => s.order === enr.currentStep + 1);
    if (next) {
      await prisma.enrollment.update({
        where: { id: enr.id },
        data: {
          currentStep: next.order,
          nextRunAt: new Date(Date.now() + delayToMs(next.delayValue, next.delayUnit as DelayUnit)),
        },
      });
    } else {
      await prisma.enrollment.update({
        where: { id: enr.id },
        data: { status: "completed", nextRunAt: null },
      });
      completed += 1;
    }
  }

  return { processed: due.length, sent, skipped, completed, failed };
}
