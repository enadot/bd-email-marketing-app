import { Button, Card, Input } from "@heroui/react";
import { requireUser } from "@/lib/auth";
import { createOrg } from "@/lib/actions/org";

export default async function OnboardingPage() {
  await requireUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
      <Card className="w-full max-w-sm p-6">
        <Card.Header className="mb-4 flex-col items-start gap-1">
          <Card.Title className="text-xl font-bold">צור ארגון</Card.Title>
          <Card.Description className="text-sm text-neutral-500">
            כל הסדרות, אנשי הקשר והתבניות מאורגנים תחת ארגון.
          </Card.Description>
        </Card.Header>
        <form action={createOrg} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>שם הארגון</span>
            <Input name="name" placeholder="הסוכנות / החברה שלי" required />
          </label>
          <Button type="submit" variant="primary" fullWidth>
            המשך
          </Button>
        </form>
      </Card>
    </div>
  );
}
