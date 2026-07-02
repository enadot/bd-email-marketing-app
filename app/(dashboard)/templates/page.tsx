import Link from "next/link";
import { Card } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailDocumentSchema } from "@/lib/blocks/schema";
import { NewTemplateGallery } from "@/components/templates/new-template-gallery";
import { DocThumb } from "@/components/editor/doc-preview";

export default async function TemplatesPage() {
  const { org } = await requireOrg();
  const templates = await prisma.template.findMany({
    where: { orgId: org.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">תבניות</h1>
          <p className="text-sm text-neutral-500">עיצובים לשימוש חוזר בסדרות שלך</p>
        </div>
        <NewTemplateGallery />
      </div>

      {templates.length === 0 ? (
        <Card className="p-8 text-center text-neutral-500">
          אין תבניות עדיין. צור את הראשונה — אפשר להתחיל מתבנית מעוצבת מהגלריה.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {templates.map((t) => {
            const parsed = emailDocumentSchema.safeParse(t.blocks);
            return (
              <Link key={t.id} href={`/templates/${t.id}`}>
                <Card className="overflow-hidden p-2 transition-shadow hover:shadow-md">
                  {parsed.success && <DocThumb doc={parsed.data} height={150} />}
                  <div className="p-2">
                    <p className="font-medium">{t.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      עודכן {new Date(t.updatedAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
