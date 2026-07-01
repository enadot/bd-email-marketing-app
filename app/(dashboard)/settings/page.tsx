import { Button, Card, Input } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  updateOrgSettings,
  createIntegration,
} from "@/lib/actions/settings";
import { IntegrationRow } from "@/components/settings/integration-row";

export default async function SettingsPage() {
  const { org } = await requireOrg();
  const integrations = await prisma.integration.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold">הגדרות</h1>

      {/* Sending settings */}
      <Card className="p-6">
        <h2 className="mb-3 text-lg font-semibold">שליחה</h2>
        <form action={updateOrgSettings} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-neutral-500">דומיין שולח מאומת (Resend)</span>
            <Input
              name="sendingDomain"
              defaultValue={org.sendingDomain ?? ""}
              placeholder="mail.yourbrand.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-neutral-500">
              מפתח Resend API {org.resendApiKey ? "(מוגדר — השאר ריק כדי לא לשנות)" : ""}
            </span>
            <Input name="resendApiKey" type="password" placeholder="re_..." />
          </label>
          <Button type="submit" variant="primary" className="self-start">
            שמור
          </Button>
        </form>
      </Card>

      {/* Integrations */}
      <Card className="p-6">
        <h2 className="mb-1 text-lg font-semibold">אינטגרציות נכנסות</h2>
        <p className="mb-3 text-sm text-neutral-500">
          חבר טופס או CRM כדי להוסיף אנשי קשר אוטומטית. שלח POST עם JSON
          {" "}(<code className="text-xs">{`{ email, firstName, fields }`}</code>) לכתובת
          ה-Webhook, עם ה-secret בכותרת <code className="text-xs">X-Webhook-Secret</code>.
        </p>

        <form action={createIntegration} className="mb-4 flex gap-2">
          <Input name="name" placeholder="שם האינטגרציה (לדוגמה: טופס אתר)" className="flex-1" />
          <Button type="submit" variant="outline">
            צור אינטגרציה
          </Button>
        </form>

        {integrations.length === 0 ? (
          <p className="text-sm text-neutral-400">אין אינטגרציות עדיין.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {integrations.map((i) => (
              <IntegrationRow
                key={i.id}
                id={i.id}
                name={i.name}
                secret={i.secret}
                webhookUrl={`${appUrl}/api/webhooks/contacts?integration=${i.id}`}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
