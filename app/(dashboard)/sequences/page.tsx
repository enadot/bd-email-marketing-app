import Link from "next/link";
import { Card, buttonVariants } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SequenceStatusChip } from "@/components/ui/status-chip";
import { SequenceIcon, PlusIcon } from "@/components/dashboard/icons";

export default async function SequencesPage() {
  const { org } = await requireOrg();
  const sequences = await prisma.sequence.findMany({
    where: { orgId: org.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { steps: true, enrollments: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">סדרות</h1>
          <p className="text-sm text-neutral-500">סדרות המיילים האוטומטיות שלך</p>
        </div>
        <Link
          href="/sequences/new"
          className={buttonVariants({ variant: "primary", className: "gap-1.5" })}
        >
          <PlusIcon /> סדרה חדשה
        </Link>
      </div>

      {sequences.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-950/50">
            <SequenceIcon className="h-6 w-6" />
          </div>
          <p className="font-medium">עדיין אין סדרות</p>
          <p className="max-w-xs text-sm text-neutral-500">
            צור את הסדרה הראשונה שלך — עם AI מבריף, או ידנית.
          </p>
          <Link
            href="/sequences/new"
            className={buttonVariants({ variant: "primary", className: "mt-1" })}
          >
            צור סדרה
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {sequences.map((s) => (
            <Link key={s.id} href={`/sequences/${s.id}`} className="group">
              <Card className="flex items-center justify-between p-4 transition-all group-hover:border-blue-200 group-hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
                    <SequenceIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-neutral-500">
                      {s._count.steps} מיילים · {s._count.enrollments} רשומים
                    </p>
                  </div>
                </div>
                <SequenceStatusChip status={s.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
