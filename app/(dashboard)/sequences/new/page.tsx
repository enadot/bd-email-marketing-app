import { Button, Card, Input } from "@heroui/react";
import Link from "next/link";
import { buttonVariants } from "@heroui/react";
import { requireOrg } from "@/lib/auth";
import { createManualSequence } from "@/lib/actions/sequence";
import { AiSequenceCreator } from "@/components/ai/ai-sequence-creator";

export default async function NewSequencePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  await requireOrg();
  const { mode } = await searchParams;

  if (mode === "ai") return <AiSequenceCreator />;

  if (mode === "manual") {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="text-2xl font-bold">סדרה ידנית חדשה</h1>
        <Card className="p-6">
          <form action={createManualSequence} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-neutral-500">שם הסדרה</span>
              <Input name="name" placeholder="לדוגמה: סדרת ברוכים הבאים" required />
            </label>
            <Button type="submit" variant="primary" fullWidth>
              צור והתחל לערוך
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Mode chooser.
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold">איך תרצה ליצור את הסדרה?</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-2 p-6">
          <h2 className="text-lg font-semibold">✨ עם AI</h2>
          <p className="flex-1 text-sm text-neutral-500">
            כתוב בריף קצר ו-Claude יבנה את כל סדרת המיילים לאישורך.
          </p>
          <Link href="/sequences/new?mode=ai" className={buttonVariants({ variant: "primary" })}>
            התחל עם בריף
          </Link>
        </Card>
        <Card className="flex flex-col gap-2 p-6">
          <h2 className="text-lg font-semibold">🛠️ ידני</h2>
          <p className="flex-1 text-sm text-neutral-500">
            בנה סדרה צעד-צעד, כולל שכפול מתבניות שמורות.
          </p>
          <Link
            href="/sequences/new?mode=manual"
            className={buttonVariants({ variant: "outline" })}
          >
            בנייה ידנית
          </Link>
        </Card>
      </div>
    </div>
  );
}
