import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SequenceEditorClient } from "@/components/sequence/sequence-editor-client";
import { EnrollPanel } from "@/components/sequence/enroll-panel";

export default async function SequenceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { org } = await requireOrg();

  const sequence = await prisma.sequence.findFirst({
    where: { id, orgId: org.id },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!sequence) notFound();

  const [tags, activeCount] = await Promise.all([
    prisma.contactTag.findMany({
      where: { orgId: org.id },
      include: { _count: { select: { contacts: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.enrollment.count({ where: { sequenceId: sequence.id, status: "active" } }),
  ]);

  const steps = sequence.steps.map((s) => ({
    id: s.id,
    order: s.order,
    subject: s.subject,
    preheader: s.preheader,
    delayValue: s.delayValue,
    delayUnit: s.delayUnit,
    conditions: s.conditions,
    blocks: s.blocks,
  }));

  return (
    <div className="flex flex-col gap-5">
      <EnrollPanel
        sequenceId={sequence.id}
        activeCount={activeCount}
        tags={tags.map((t) => ({ id: t.id, name: t.name, count: t._count.contacts }))}
      />
      <SequenceEditorClient
        id={sequence.id}
        name={sequence.name}
        status={sequence.status}
        steps={steps}
      />
    </div>
  );
}
