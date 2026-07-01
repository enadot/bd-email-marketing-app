import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  aiSequenceSchema,
  aiSequenceJsonSchema,
  briefInputSchema,
  type AiSequence,
  type BriefInput,
} from "./schema";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function buildPrompt(brief: BriefInput, regenerateNote?: string) {
  return [
    `You are an expert email-marketing copywriter. Generate a drip email sequence.`,
    `Write all copy in this language: ${brief.language || "he"}.`,
    ``,
    `Topic / goal: ${brief.topic}`,
    brief.audience ? `Target audience: ${brief.audience}` : ``,
    brief.tone ? `Tone of voice: ${brief.tone}` : ``,
    brief.goal ? `Business goal / desired action: ${brief.goal}` : ``,
    brief.ctaUrl ? `Primary CTA URL to use in buttons: ${brief.ctaUrl}` : ``,
    brief.brandNotes ? `Brand notes / constraints: ${brief.brandNotes}` : ``,
    ``,
    `Produce exactly ${brief.emailCount} emails.`,
    `Space them sensibly with delayDays (first email delayDays = 0).`,
    `Each email must have a subject, a preheader, a heading, 1-3 short paragraphs,`,
    `and a call-to-action button when it helps conversion.`,
    `Use {{firstName}} where a personal greeting fits.`,
    regenerateNote ? `\nRevision request: ${regenerateNote}` : ``,
    ``,
    `Return the result by calling the build_sequence tool. Do not write prose.`,
  ]
    .filter(Boolean)
    .join("\n");
}

// Calls Claude with a forced tool call and returns the validated sequence.
export async function generateSequence(
  rawBrief: BriefInput,
  regenerateNote?: string,
): Promise<{ sequence: AiSequence; model: string }> {
  const brief = briefInputSchema.parse(rawBrief);

  const message = await client().messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [
      {
        name: "build_sequence",
        description: "Return the generated email sequence in structured form.",
        input_schema: aiSequenceJsonSchema as unknown as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: "build_sequence" },
    messages: [{ role: "user", content: buildPrompt(brief, regenerateNote) }],
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured sequence.");
  }

  const sequence = aiSequenceSchema.parse(toolUse.input);
  return { sequence, model: MODEL };
}

// Regenerates a single email within an existing sequence given feedback.
export async function regenerateStep(
  brief: BriefInput,
  stepIndex: number,
  note: string,
): Promise<{ sequence: AiSequence; model: string }> {
  return generateSequence(
    brief,
    `Regenerate email #${stepIndex + 1} specifically. ${note}`,
  );
}
