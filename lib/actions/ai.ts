"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";
import { generateSequence, regenerateStep } from "@/lib/ai/generate-sequence";
import { aiStepToDocument } from "@/lib/ai/to-blocks";
import { briefInputSchema, aiSequenceSchema, type AiSequence, type BriefInput } from "@/lib/ai/schema";

// Generates a draft sequence from a brief (not persisted yet).
export async function generateSequenceDraft(brief: BriefInput): Promise<
  { ok: true; sequence: AiSequence } | { ok: false; error: string }
> {
  await requireOrg();
  try {
    const parsed = briefInputSchema.parse(brief);
    const { sequence } = await generateSequence(parsed);
    return { ok: true, sequence };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה ביצירה" };
  }
}

// Regenerates a single email and returns the whole refreshed draft.
export async function regenerateStepDraft(
  brief: BriefInput,
  stepIndex: number,
  note: string,
): Promise<{ ok: true; sequence: AiSequence } | { ok: false; error: string }> {
  await requireOrg();
  try {
    const parsed = briefInputSchema.parse(brief);
    const { sequence } = await regenerateStep(parsed, stepIndex, note);
    return { ok: true, sequence };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה ביצירה" };
  }
}

// Persists an approved draft as a real Sequence + steps + Brief record.
export async function createSequenceFromDraft(input: {
  brief: BriefInput;
  sequence: AiSequence;
}) {
  const { org } = await requireOrg();
  const brief = briefInputSchema.parse(input.brief);
  const draft = aiSequenceSchema.parse(input.sequence);

  const created = await prisma.sequence.create({
    data: {
      orgId: org.id,
      name: draft.name || brief.topic,
      status: "draft",
      steps: {
        create: draft.steps.map((step, i) => ({
          order: i,
          delayValue: step.delayDays,
          delayUnit: "days",
          subject: step.subject,
          preheader: step.preheader || null,
          blocks: aiStepToDocument(step),
        })),
      },
      briefs: {
        create: {
          orgId: org.id,
          input: brief,
          claudeOutput: draft,
          model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
        },
      },
    },
  });

  redirect(`/sequences/${created.id}`);
}
