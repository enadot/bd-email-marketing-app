"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";
import { emailDocumentSchema, emptyDocument, type EmailDocument } from "@/lib/blocks/schema";
import { getGalleryTemplate } from "@/lib/blocks/gallery";
import { renderEmail } from "@/lib/email/render";
import { getResend, fromAddress } from "@/lib/resend";

// Sample merge data used for previews and test sends.
const SAMPLE_DATA = { firstName: "אביב", lastName: "כהן", email: "demo@example.com" };

// Creates a template (blank, or seeded from a gallery template) and opens its editor.
export async function createTemplate(formData: FormData) {
  const { org } = await requireOrg();
  const gallery = getGalleryTemplate(String(formData.get("gallery") ?? ""));
  const name =
    String(formData.get("name") ?? "").trim() || gallery?.name || "תבנית ללא שם";

  const template = await prisma.template.create({
    data: { orgId: org.id, name, type: "content", blocks: gallery?.doc ?? emptyDocument },
  });

  redirect(`/templates/${template.id}`);
}

// Persists the document + name for an existing template (ownership enforced via orgId).
export async function saveTemplate(input: {
  id: string;
  name: string;
  doc: EmailDocument;
}) {
  const { org } = await requireOrg();
  const doc = emailDocumentSchema.parse(input.doc);

  await prisma.template.update({
    where: { id: input.id, orgId: org.id },
    data: { name: input.name.trim() || "תבנית ללא שם", blocks: doc },
  });

  revalidatePath(`/templates/${input.id}`);
  revalidatePath("/templates");
  return { ok: true };
}

export async function deleteTemplate(id: string) {
  const { org } = await requireOrg();
  await prisma.template.delete({ where: { id, orgId: org.id } });
  revalidatePath("/templates");
  redirect("/templates");
}

// Renders the real send-time HTML (with sample merge data) for the preview modal.
export async function previewEmailHtml(doc: EmailDocument): Promise<{ html: string }> {
  await requireOrg(); // auth only — preview is org-agnostic
  const parsed = emailDocumentSchema.parse(doc);
  const { html } = await renderEmail(parsed, SAMPLE_DATA, "https://example.com/unsubscribe");
  return { html };
}

// Sends a one-off test email of the current document to the given address.
export async function sendTestEmail(input: {
  doc: EmailDocument;
  to: string;
  subject?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { org } = await requireOrg();
  const to = input.to.trim();
  if (!/^\S+@\S+\.\S+$/.test(to)) return { ok: false, error: "כתובת מייל לא תקינה" };

  try {
    const doc = emailDocumentSchema.parse(input.doc);
    const { html, text } = await renderEmail(doc, SAMPLE_DATA);
    const resend = getResend(org);
    const { error } = await resend.emails.send({
      from: fromAddress(org),
      to,
      subject: input.subject?.trim() || `[בדיקה] ${org.name}`,
      html,
      text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "השליחה נכשלה" };
  }
}
