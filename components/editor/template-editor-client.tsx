"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { BlockEditor } from "./block-editor";
import { saveTemplate, deleteTemplate } from "@/lib/actions/template";
import type { EmailDocument } from "@/lib/blocks/schema";

const AUTOSAVE_MS = 1500;

export function TemplateEditorClient({
  id,
  initialName,
  initialDoc,
}: {
  id: string;
  initialName: string;
  initialDoc: EmailDocument;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [doc, setDoc] = useState<EmailDocument>(initialDoc);
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const skipFirst = useRef(true);

  function persist(nextName: string, nextDoc: EmailDocument) {
    startSaving(async () => {
      await saveTemplate({ id, name: nextName, doc: nextDoc });
      setSavedAt(new Date().toLocaleTimeString("he-IL"));
      setDirty(false);
    });
  }

  // Debounced autosave on any change to the name or the document.
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    setDirty(true);
    const timer = setTimeout(() => persist(name, doc), AUTOSAVE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, doc]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs text-lg font-semibold"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            {saving ? "שומר…" : dirty ? "שינויים לא שמורים" : savedAt ? `נשמר אוטומטית ${savedAt}` : ""}
          </span>
          <Button variant="outline" onPress={() => router.push("/templates")}>
            חזרה
          </Button>
          <Button
            variant="danger-soft"
            onPress={() => {
              if (confirm("למחוק את התבנית?")) deleteTemplate(id);
            }}
          >
            מחק
          </Button>
          <Button variant="primary" onPress={() => persist(name, doc)} isDisabled={saving}>
            {saving ? "שומר…" : "שמור"}
          </Button>
        </div>
      </div>

      <BlockEditor initialDoc={doc} onChange={setDoc} />
    </div>
  );
}
