"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@heroui/react";
import {
  addContact,
  importContactsCsv,
  syncToResendAudience,
} from "@/lib/actions/contact";

export function ContactsToolbar() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tag, setTag] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  function onAdd(formData: FormData) {
    startBusy(async () => {
      const res = await addContact(formData);
      setMsg(res.ok ? "נוסף ✓" : res.error ?? "שגיאה");
      if (res.ok) router.refresh();
    });
  }

  function onImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return setMsg("בחר קובץ CSV");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("tag", tag);
    startBusy(async () => {
      const res = await importContactsCsv(fd);
      setMsg(res.ok ? `יובאו ${res.imported}, דולגו ${res.skipped}` : res.error ?? "שגיאה");
      if (res.ok) router.refresh();
    });
  }

  function onSync() {
    startBusy(async () => {
      const res = await syncToResendAudience();
      setMsg(res.ok ? `סונכרנו ${res.count} ל-Resend Audience` : res.error ?? "שגיאה");
    });
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Add single contact */}
        <form action={onAdd} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-neutral-500">הוספת איש קשר</p>
          <Input name="email" type="email" placeholder="email@company.com" required />
          <Input name="firstName" placeholder="שם פרטי (אופציונלי)" />
          <Button type="submit" variant="primary" isDisabled={busy}>
            הוסף
          </Button>
        </form>

        {/* CSV import */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-neutral-500">ייבוא CSV</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 dark:file:bg-neutral-800"
          />
          <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="תגית לכולם (אופציונלי)" />
          <Button variant="outline" onPress={onImport} isDisabled={busy}>
            ייבא
          </Button>
        </div>

        {/* Resend audience sync */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-neutral-500">Resend Audience</p>
          <p className="flex-1 text-xs text-neutral-400">
            צור/עדכן Audience ב-Resend מכל אנשי הקשר הרשומים.
          </p>
          <Button variant="outline" onPress={onSync} isDisabled={busy}>
            סנכרן ל-Resend
          </Button>
        </div>
      </div>

      {msg && <p className="text-sm text-neutral-600 dark:text-neutral-300">{msg}</p>}
    </Card>
  );
}
