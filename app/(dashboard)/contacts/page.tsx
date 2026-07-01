import { Card, Chip } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContactsToolbar } from "@/components/contacts/contacts-toolbar";
import { CONTACT_SOURCE_LABEL } from "@/lib/labels";

export default async function ContactsPage() {
  const { org } = await requireOrg();
  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where: { orgId: org.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { tags: { include: { tag: true } } },
    }),
    prisma.contact.count({ where: { orgId: org.id } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">אנשי קשר</h1>
        <span className="text-sm text-neutral-500">{total} סה״כ</span>
      </div>

      <ContactsToolbar />

      {contacts.length === 0 ? (
        <Card className="p-8 text-center text-neutral-500">
          אין אנשי קשר עדיין. הוסף ידנית או ייבא CSV.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="p-3 font-medium">אימייל</th>
                <th className="p-3 font-medium">שם</th>
                <th className="p-3 font-medium">תגיות</th>
                <th className="p-3 font-medium">מקור</th>
                <th className="p-3 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</td>
                  <td className="p-3">
                    {c.tags.length
                      ? c.tags.map((t) => (
                          <span
                            key={t.tagId}
                            className="mr-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800"
                          >
                            {t.tag.name}
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td className="p-3 text-xs text-neutral-400">
                    {CONTACT_SOURCE_LABEL[c.source] ?? c.source}
                  </td>
                  <td className="p-3">
                    <Chip color={c.subscribed ? "success" : "default"} size="sm">
                      {c.subscribed ? "רשום" : "הוסר"}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
