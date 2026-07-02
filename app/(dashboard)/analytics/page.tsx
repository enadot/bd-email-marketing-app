import { Card } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Counts = { sent: number; delivered: number; opened: number; clicked: number; bounced: number };
type StatusMap = Record<string, number>;

// SendLog statuses are terminal-ish snapshots; "sent" here means any successful send.
// Pure derivation from a status→count map so the whole page can be served by a
// single grouped query instead of one query per sequence (the old N+1).
function countsFromMap(map: StatusMap): Counts {
  const opened = (map.opened ?? 0) + (map.clicked ?? 0); // a click implies an open
  const delivered = (map.delivered ?? 0) + opened;
  const total = Object.values(map).reduce((a, n) => a + n, 0);
  return {
    sent: total - (map.failed ?? 0),
    delivered,
    opened,
    clicked: map.clicked ?? 0,
    bounced: map.bounced ?? 0,
  };
}

function pct(n: number, d: number) {
  return d === 0 ? "—" : `${Math.round((n / d) * 100)}%`;
}

export default async function AnalyticsPage() {
  const { org } = await requireOrg();

  // Three fixed queries regardless of how many sequences exist: the sequence
  // list, the enrollment→sequence lookup, and one grouped count of every send
  // log in the org. We fold the counts per sequence (and overall) in memory.
  const [sequences, enrollments, grouped] = await Promise.all([
    prisma.sequence.findMany({
      where: { orgId: org.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { sequence: { orgId: org.id } },
      select: { id: true, sequenceId: true },
    }),
    prisma.sendLog.groupBy({
      by: ["enrollmentId", "status"],
      where: { enrollment: { sequence: { orgId: org.id } } },
      _count: { _all: true },
    }),
  ]);

  const sequenceOfEnrollment = new Map(
    enrollments.map((e) => [e.id, e.sequenceId]),
  );

  const totalStatus: StatusMap = {};
  const perSequenceStatus = new Map<string, StatusMap>();
  for (const g of grouped) {
    const n = g._count._all;
    totalStatus[g.status] = (totalStatus[g.status] ?? 0) + n;

    const seqId = sequenceOfEnrollment.get(g.enrollmentId);
    if (!seqId) continue;
    const rec = perSequenceStatus.get(seqId) ?? {};
    rec[g.status] = (rec[g.status] ?? 0) + n;
    perSequenceStatus.set(seqId, rec);
  }

  const totals = countsFromMap(totalStatus);
  const perSequence = sequences.map((s) => ({
    sequence: s,
    counts: countsFromMap(perSequenceStatus.get(s.id) ?? {}),
  }));

  const cards = [
    { label: "נשלחו", value: totals.sent },
    { label: "נמסרו", value: totals.delivered },
    { label: "נפתחו", value: totals.opened, sub: pct(totals.opened, totals.delivered) },
    { label: "נלחצו", value: totals.clicked, sub: pct(totals.clicked, totals.delivered) },
    { label: "הוחזרו", value: totals.bounced },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">אנליטיקס</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
            {c.sub && <p className="text-xs text-neutral-400">{c.sub}</p>}
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="p-3 font-medium">סדרה</th>
              <th className="p-3 font-medium">נשלחו</th>
              <th className="p-3 font-medium">נמסרו</th>
              <th className="p-3 font-medium">פתיחות</th>
              <th className="p-3 font-medium">קליקים</th>
              <th className="p-3 font-medium">באונסים</th>
            </tr>
          </thead>
          <tbody>
            {perSequence.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-400">
                  אין נתונים עדיין.
                </td>
              </tr>
            ) : (
              perSequence.map(({ sequence, counts }) => (
                <tr key={sequence.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-3">{sequence.name}</td>
                  <td className="p-3">{counts.sent}</td>
                  <td className="p-3">{counts.delivered}</td>
                  <td className="p-3">
                    {counts.opened} <span className="text-xs text-neutral-400">({pct(counts.opened, counts.delivered)})</span>
                  </td>
                  <td className="p-3">
                    {counts.clicked} <span className="text-xs text-neutral-400">({pct(counts.clicked, counts.delivered)})</span>
                  </td>
                  <td className="p-3">{counts.bounced}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
