import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailDocumentSchema } from "@/lib/blocks/schema";
import { TemplateEditorClient } from "@/components/editor/template-editor-client";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { org } = await requireOrg();

  const template = await prisma.template.findFirst({
    where: { id, orgId: org.id },
  });
  if (!template) notFound();

  // Stored JSON is validated/normalized back into a typed document.
  const doc = emailDocumentSchema.parse(template.blocks);

  return (
    <TemplateEditorClient id={template.id} initialName={template.name} initialDoc={doc} />
  );
}
