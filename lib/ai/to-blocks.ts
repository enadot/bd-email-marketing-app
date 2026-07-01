import { emailDocumentSchema, type EmailDocument } from "@/lib/blocks/schema";
import type { AiStep } from "./schema";

let counter = 0;
function blockId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

// Converts one AI-generated step into an editable block document.
export function aiStepToDocument(step: AiStep): EmailDocument {
  const blocks: EmailDocument["blocks"] = [
    { id: blockId("h"), type: "heading", text: step.heading, level: 1, align: "right" },
    ...step.paragraphs.map((p) => ({
      id: blockId("t"),
      type: "text" as const,
      text: p,
      align: "right" as const,
    })),
  ];

  if (step.cta) {
    blocks.push({
      id: blockId("b"),
      type: "button",
      text: step.cta.text,
      url: step.cta.url,
      align: "center",
    });
  }

  return emailDocumentSchema.parse({ blocks });
}
