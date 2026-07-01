"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@heroui/react";
import { enrollContacts } from "@/lib/actions/enroll";

export function EnrollPanel({
  sequenceId,
  tags,
  activeCount,
}: {
  sequenceId: string;
  tags: { id: string; name: string; count: number }[];
  activeCount: number;
}) {
  const router = useRouter();
  const [tagId, setTagId] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  function enroll() {
    setMsg(null);
    startBusy(async () => {
      const res = await enrollContacts({ sequenceId, tagId: tagId || undefined });
      setMsg(res.ok ? `שויכו ${res.enrolled} אנשי קשר. הסדרה פעילה ✓` : res.error ?? "שגיאה");
      if (res.ok) router.refresh();
    });
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">הפעלה ושיוך אנשי קשר</p>
        <span className="text-sm text-neutral-500">{activeCount} רשומים פעילים</span>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-neutral-500">קהל יעד</span>
          <select
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">כל אנשי הקשר הרשומים</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                תגית: {t.name} ({t.count})
              </option>
            ))}
          </select>
        </label>
        <Button variant="primary" onPress={enroll} isDisabled={busy}>
          {busy ? "משייך…" : "הפעל ושייך"}
        </Button>
      </div>
      {msg && <p className="text-sm text-neutral-600 dark:text-neutral-300">{msg}</p>}
      <p className="text-xs text-neutral-400">
        אנשי קשר שכבר משויכים לא ישויכו מחדש. השליחה מתבצעת אוטומטית לפי התזמון.
      </p>
    </Card>
  );
}
