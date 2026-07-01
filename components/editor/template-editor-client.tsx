"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { BlockEditor } from "./block-editor";
import { saveTemplate } from "@/lib/actions/template";
import { deleteTemplate } from "@/lib/actions/template";
import type { EmailDocument } from "@/lib/blocks/schema";

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

  function save() {
    startSaving(async () => {
      await saveTemplate({ id, name, doc });
      setSavedAt(new Date().toLocaleTimeString("he-IL"));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs text-lg font-semibold"
        />
        <div className="flex items-center gap-2">
          {savedAt && <span className="text-xs text-neutral-400">נשמר {savedAt}</span>}
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
          <Button variant="primary" onPress={save} isDisabled={saving}>
            {saving ? "שומר…" : "שמור"}
          </Button>
        </div>
      </div>

      <BlockEditor initialDoc={doc} onChange={setDoc} />
    </div>
  );
}
