"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";
import { emailDocumentSchema, emptyDocument, type EmailDocument } from "@/lib/blocks/schema";

// Creates a blank template and opens its editor.
export async function createTemplate(formData: FormData) {
  const { org } = await requireOrg();
  const name = String(formData.get("name") ?? "").trim() || "תבנית ללא שם";

  const template = await prisma.template.create({
    data: { orgId: org.id, name, type: "content", blocks: emptyDocument },
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
