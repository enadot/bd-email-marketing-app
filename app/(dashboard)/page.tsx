import Link from "next/link";
import { Card, buttonVariants } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardHome() {
  const { org } = await requireOrg();

  const [sequences, contacts, templates, activeEnrollments] = await Promise.all([
    prisma.sequence.count({ where: { orgId: org.id } }),
    prisma.contact.count({ where: { orgId: org.id } }),
    prisma.template.count({ where: { orgId: org.id } }),
    prisma.enrollment.count({
      where: { sequence: { orgId: org.id }, status: "active" },
    }),
  ]);

  const stats = [
    { label: "סדרות", value: sequences, href: "/sequences" },
    { label: "אנשי קשר", value: contacts, href: "/contacts" },
    { label: "תבניות", value: templates, href: "/templates" },
    { label: "רשומים פעילים", value: activeEnrollments, href: "/analytics" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">סקירה</h1>
          <p className="text-sm text-neutral-500">{org.name}</p>
        </div>
        <Link href="/sequences/new" className={buttonVariants({ variant: "primary" })}>
          סדרה חדשה
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-4 transition-shadow hover:shadow-md">
              <p className="text-sm text-neutral-500">{s.label}</p>
              <p className="mt-1 text-3xl font-bold">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="mb-2 text-lg font-semibold">שתי דרכים ליצור סדרה</h2>
        <div className="flex flex-col gap-3 md:flex-row">
          <Card className="flex-1 p-4">
            <h3 className="font-medium">✨ עם AI</h3>
            <p className="mt-1 text-sm text-neutral-500">
              כתוב בריף קצר ו-Claude יבנה את כל הסדרה לאישורך.
            </p>
            <Link
              href="/sequences/new?mode=ai"
              className={buttonVariants({ variant: "primary", className: "mt-3" })}
            >
              התחל עם בריף
            </Link>
          </Card>
          <Card className="flex-1 p-4">
            <h3 className="font-medium">🛠️ ידני</h3>
            <p className="mt-1 text-sm text-neutral-500">
              בנה סדרה צעד-צעד, כולל שכפול מתבניות שמורות.
            </p>
            <Link
              href="/sequences/new?mode=manual"
              className={buttonVariants({ variant: "outline", className: "mt-3" })}
            >
              בנייה ידנית
            </Link>
          </Card>
        </div>
      </Card>
    </div>
  );
}
