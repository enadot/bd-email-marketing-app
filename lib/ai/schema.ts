import { z } from "zod";

// What the user fills in the brief form.
export const briefInputSchema = z.object({
  topic: z.string().min(3), // נושא / מטרת הסדרה
  audience: z.string().optional(), // קהל יעד
  tone: z.string().optional(), // טון
  emailCount: z.number().int().min(1).max(10).default(4),
  goal: z.string().optional(), // CTA / מטרה עסקית
  ctaUrl: z.string().optional(),
  brandNotes: z.string().optional(), // אילוצי מותג / מידע נוסף
  language: z.string().default("he"),
});
export type BriefInput = z.infer<typeof briefInputSchema>;

// The structured shape we force Claude to return (one entry per email).
export const aiStepSchema = z.object({
  delayDays: z.number().int().min(0),
  subject: z.string(),
  preheader: z.string().default(""),
  heading: z.string(),
  paragraphs: z.array(z.string()).default([]),
  cta: z
    .object({ text: z.string(), url: z.string() })
    .nullable()
    .optional(),
});
export type AiStep = z.infer<typeof aiStepSchema>;

export const aiSequenceSchema = z.object({
  name: z.string(),
  steps: z.array(aiStepSchema).min(1),
});
export type AiSequence = z.infer<typeof aiSequenceSchema>;

// JSON Schema handed to Claude as the tool input_schema (kept in sync manually
// with aiSequenceSchema — Claude validates against this, zod re-validates after).
export const aiSequenceJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string", description: "A short internal name for the sequence" },
    steps: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          delayDays: {
            type: "integer",
            minimum: 0,
            description: "Days to wait after the previous email (0 for the first)",
          },
          subject: { type: "string", description: "Email subject line" },
          preheader: { type: "string", description: "Preview text shown after the subject" },
          heading: { type: "string", description: "Main heading inside the email" },
          paragraphs: {
            type: "array",
            items: { type: "string" },
            description: "Body paragraphs. May use {{firstName}} merge tags.",
          },
          cta: {
            type: ["object", "null"],
            properties: {
              text: { type: "string" },
              url: { type: "string" },
            },
            required: ["text", "url"],
            description: "Optional call-to-action button",
          },
        },
        required: ["delayDays", "subject", "heading", "paragraphs"],
      },
    },
  },
  required: ["name", "steps"],
} as const;
