import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Block model — the single source of truth for an email's content.
// The editor edits this, Claude generates this, and the renderer
// turns it into React Email → HTML at send time.
// ─────────────────────────────────────────────────────────────

export const headingBlock = z.object({
  id: z.string(),
  type: z.literal("heading"),
  text: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  align: z.enum(["left", "center", "right"]).default("right"),
});

export const textBlock = z.object({
  id: z.string(),
  type: z.literal("text"),
  // May contain merge tags like {{firstName}}.
  text: z.string(),
  align: z.enum(["left", "center", "right"]).default("right"),
});

export const imageBlock = z.object({
  id: z.string(),
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().default(""),
  href: z.string().optional(),
  width: z.number().optional(),
});

export const buttonBlock = z.object({
  id: z.string(),
  type: z.literal("button"),
  text: z.string(),
  url: z.string(),
  align: z.enum(["left", "center", "right"]).default("center"),
});

export const dividerBlock = z.object({
  id: z.string(),
  type: z.literal("divider"),
});

export const spacerBlock = z.object({
  id: z.string(),
  type: z.literal("spacer"),
  height: z.number().default(24),
});

export const blockSchema = z.discriminatedUnion("type", [
  headingBlock,
  textBlock,
  imageBlock,
  buttonBlock,
  dividerBlock,
  spacerBlock,
]);

const DEFAULT_SETTINGS = {
  backgroundColor: "#f4f4f5",
  contentBackground: "#ffffff",
  brandColor: "#3b82f6",
  textColor: "#18181b",
  fontFamily: "Arial, sans-serif",
  direction: "rtl" as const,
};

export const emailDocumentSchema = z.object({
  // Visual settings for the email shell.
  settings: z
    .object({
      backgroundColor: z.string().default(DEFAULT_SETTINGS.backgroundColor),
      contentBackground: z.string().default(DEFAULT_SETTINGS.contentBackground),
      brandColor: z.string().default(DEFAULT_SETTINGS.brandColor),
      textColor: z.string().default(DEFAULT_SETTINGS.textColor),
      fontFamily: z.string().default(DEFAULT_SETTINGS.fontFamily),
      direction: z.enum(["ltr", "rtl"]).default("rtl"),
    })
    .default(DEFAULT_SETTINGS),
  blocks: z.array(blockSchema).default([]),
});

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type EmailDocument = z.infer<typeof emailDocumentSchema>;
export type EmailSettings = EmailDocument["settings"];

// A safe empty document used when creating new templates/steps.
export const emptyDocument: EmailDocument = emailDocumentSchema.parse({
  blocks: [],
});

// Default content for each block type when added in the editor.
export function defaultBlock(type: BlockType, id: string): Block {
  switch (type) {
    case "heading":
      return { id, type, text: "כותרת חדשה", level: 2, align: "right" };
    case "text":
      return {
        id,
        type,
        text: "כתוב כאן את הטקסט שלך. אפשר להשתמש ב-{{firstName}} למיזוג.",
        align: "right",
      };
    case "image":
      return { id, type, src: "https://via.placeholder.com/600x200", alt: "" };
    case "button":
      return { id, type, text: "לחצו כאן", url: "https://", align: "center" };
    case "divider":
      return { id, type };
    case "spacer":
      return { id, type, height: 24 };
  }
}
