import { Card } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Counts = { sent: number; delivered: number; opened: number; clicked: number; bounced: number };

// SendLog statuses are terminal-ish snapshots; "sent" here means any successful send.
async function countsFor(where: object): Promise<Counts> {
  const grouped = await prisma.sendLog.groupBy({
    by: ["status"],
    where,
    _count: { _all: true },
  });
  const map = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
  const opened = (map.opened ?? 0) + (map.clicked ?? 0); // a click implies an open
  const delivered = (map.delivered ?? 0) + opened;
  return {
    sent: grouped.reduce((a, g) => a + g._count._all, 0) - (map.failed ?? 0),
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

  const sequences = await prisma.sequence.findMany({
    where: { orgId: org.id },
    orderBy: { updatedAt: "desc" },
  });

  const totals = await countsFor({ enrollment: { sequence: { orgId: org.id } } });
  const perSequence = await Promise.all(
    sequences.map(async (s) => ({
      sequence: s,
      counts: await countsFor({ enrollment: { sequenceId: s.id } }),
    })),
  );

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
