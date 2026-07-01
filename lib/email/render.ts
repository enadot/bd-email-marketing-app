import { render } from "@react-email/components";
import * as React from "react";
import { EmailDocumentView } from "@/emails/email-document";
import type { EmailDocument } from "@/lib/blocks/schema";

// Renders an email document to the HTML + plain-text pair Resend expects.
export async function renderEmail(
  doc: EmailDocument,
  data: Record<string, unknown> = {},
  unsubscribeUrl?: string,
): Promise<{ html: string; text: string }> {
  const element = React.createElement(EmailDocumentView, { doc, data, unsubscribeUrl });
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}
