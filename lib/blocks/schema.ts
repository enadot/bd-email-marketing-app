import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Block model — the single source of truth for an email's content.
// The editor edits this, Claude generates this, and the renderer
// turns it into React Email → HTML at send time.
//
// All styling fields are optional so documents saved by older
// versions of the editor keep parsing unchanged.
// ─────────────────────────────────────────────────────────────

const align = z.enum(["left", "center", "right"]);

export const headingBlock = z.object({
  id: z.string(),
  type: z.literal("heading"),
  text: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  align: align.default("right"),
  // Overrides settings.textColor when set.
  color: z.string().optional(),
});

export const textBlock = z.object({
  id: z.string(),
  type: z.literal("text"),
  // May contain merge tags like {{firstName}}.
  text: z.string(),
  align: align.default("right"),
  color: z.string().optional(),
  fontSize: z.number().optional(), // px, defaults to 16 in the renderer
});

export const imageBlock = z.object({
  id: z.string(),
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().default(""),
  href: z.string().optional(),
  width: z.number().optional(),
  align: align.default("center"),
  borderRadius: z.number().optional(), // px
});

export const buttonBlock = z.object({
  id: z.string(),
  type: z.literal("button"),
  text: z.string(),
  url: z.string(),
  align: align.default("center"),
  // Style overrides; fall back to settings.brandColor / white / 8px.
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.number().optional(),
  fullWidth: z.boolean().optional(),
});

export const dividerBlock = z.object({
  id: z.string(),
  type: z.literal("divider"),
  color: z.string().optional(),
});

export const spacerBlock = z.object({
  id: z.string(),
  type: z.literal("spacer"),
  height: z.number().default(24),
});

// Callout — highlighted box for promos / important notes.
export const calloutBlock = z.object({
  id: z.string(),
  type: z.literal("callout"),
  text: z.string(),
  emoji: z.string().default("💡"),
  backgroundColor: z.string().default("#eff6ff"),
  textColor: z.string().default("#1d4ed8"),
  align: align.default("right"),
});

// Bulleted list.
export const listBlock = z.object({
  id: z.string(),
  type: z.literal("list"),
  items: z.array(z.string()).default([]),
  align: align.default("right"),
});

// Social links row rendered as text links (email-client safe, no hosted icons).
export const SOCIAL_NETWORKS = [
  "website",
  "instagram",
  "facebook",
  "x",
  "linkedin",
  "youtube",
  "tiktok",
  "whatsapp",
] as const;

export const socialBlock = z.object({
  id: z.string(),
  type: z.literal("social"),
  links: z
    .array(
      z.object({
        network: z.enum(SOCIAL_NETWORKS),
        url: z.string(),
      }),
    )
    .default([]),
  align: align.default("center"),
});

export const blockSchema = z.discriminatedUnion("type", [
  headingBlock,
  textBlock,
  imageBlock,
  buttonBlock,
  dividerBlock,
  spacerBlock,
  calloutBlock,
  listBlock,
  socialBlock,
]);

const DEFAULT_SETTINGS = {
  backgroundColor: "#f4f4f5",
  contentBackground: "#ffffff",
  brandColor: "#3b82f6",
  textColor: "#18181b",
  fontFamily: "Arial, sans-serif",
  direction: "rtl" as const,
  preheader: "",
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
      // Inbox preview text (hidden in the email body itself).
      preheader: z.string().default(""),
    })
    .default(DEFAULT_SETTINGS),
  blocks: z.array(blockSchema).default([]),
});

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type EmailDocument = z.infer<typeof emailDocumentSchema>;
export type EmailSettings = EmailDocument["settings"];
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  website: "אתר",
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

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
      return {
        id,
        type,
        src: "https://placehold.co/600x200/e4e4e7/71717a?text=Image",
        alt: "",
        align: "center",
      };
    case "button":
      return { id, type, text: "לחצו כאן", url: "https://", align: "center" };
    case "divider":
      return { id, type };
    case "spacer":
      return { id, type, height: 24 };
    case "callout":
      return {
        id,
        type,
        text: "טקסט חשוב שכדאי להדגיש",
        emoji: "💡",
        backgroundColor: "#eff6ff",
        textColor: "#1d4ed8",
        align: "right",
      };
    case "list":
      return { id, type, items: ["פריט ראשון", "פריט שני", "פריט שלישי"], align: "right" };
    case "social":
      return {
        id,
        type,
        links: [
          { network: "instagram", url: "https://instagram.com/" },
          { network: "facebook", url: "https://facebook.com/" },
        ],
        align: "center",
      };
  }
}
