import Link from "next/link";
import { Button, Card, Input } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTemplate } from "@/lib/actions/template";

export default async function TemplatesPage() {
  const { org } = await requireOrg();
  const templates = await prisma.template.findMany({
    where: { orgId: org.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">תבניות</h1>
        <form action={createTemplate} className="flex gap-2">
          <Input name="name" placeholder="שם התבנית" className="w-48" />
          <Button type="submit" variant="primary">
            תבנית חדשה
          </Button>
        </form>
      </div>

      {templates.length === 0 ? (
        <Card className="p-8 text-center text-neutral-500">
          אין תבניות עדיין. צור את הראשונה כדי לעצב מייל לשימוש חוזר.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {templates.map((t) => (
            <Link key={t.id} href={`/templates/${t.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <p className="font-medium">{t.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  עודכן {new Date(t.updatedAt).toLocaleDateString("he-IL")}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
