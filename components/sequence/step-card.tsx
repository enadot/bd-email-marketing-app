"use client";

import { useState, useTransition } from "react";
import { Button, Card, Checkbox, Input } from "@heroui/react";
import { Select } from "@/components/ui/select";
import { BlockEditor } from "@/components/editor/block-editor";
import { saveStep, deleteStep } from "@/lib/actions/sequence";
import { emailDocumentSchema, type EmailDocument } from "@/lib/blocks/schema";

export type StepData = {
  id: string;
  order: number;
  subject: string;
  preheader: string | null;
  delayValue: number;
  delayUnit: "minutes" | "hours" | "days";
  conditions: unknown;
  blocks: unknown;
};

type SkipCondition = { skipIf?: { event: "opened" | "clicked"; step: "previous" } };

export function StepCard({
  step,
  sequenceId,
  index,
}: {
  step: StepData;
  sequenceId: string;
  index: number;
}) {
  const [open, setOpen] = useState(index === 0);
  const [subject, setSubject] = useState(step.subject);
  const [preheader, setPreheader] = useState(step.preheader ?? "");
  const [delayValue, setDelayValue] = useState(step.delayValue);
  const [delayUnit, setDelayUnit] = useState(step.delayUnit);
  const [doc, setDoc] = useState<EmailDocument>(emailDocumentSchema.parse(step.blocks));
  const initialCond = (step.conditions as SkipCondition) ?? {};
  const [skipEnabled, setSkipEnabled] = useState(Boolean(initialCond.skipIf));
  const [skipEvent, setSkipEvent] = useState<"opened" | "clicked">(
    initialCond.skipIf?.event ?? "opened",
  );
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function save() {
    const conditions: SkipCondition = skipEnabled
      ? { skipIf: { event: skipEvent, step: "previous" } }
      : {};
    startSaving(async () => {
      await saveStep({
        id: step.id,
        sequenceId,
        subject,
        preheader,
        delayValue,
        delayUnit,
        conditions,
        doc,
      });
      setSavedAt(new Date().toLocaleTimeString("he-IL"));
    });
  }

  const delayLabel =
    delayValue === 0 ? "מיידי" : `אחרי ${delayValue} ${unitLabel(delayUnit)}`;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-right"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs text-white dark:bg-white dark:text-neutral-900">
            {index + 1}
          </span>
          <div>
            <p className="font-medium">{subject || "ללא נושא"}</p>
            <p className="text-xs text-neutral-500">{delayLabel}</p>
          </div>
        </div>
        <span className="text-neutral-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-neutral-500">נושא</span>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-neutral-500">Preheader</span>
              <Input value={preheader} onChange={(e) => setPreheader(e.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-neutral-500">
                {index === 0 ? "תזמון שליחה" : "השהיה מהמייל הקודם"}
              </span>
              <div className="flex items-stretch gap-2">
                <Input
                  type="number"
                  value={String(delayValue)}
                  onChange={(e) => setDelayValue(Number(e.target.value) || 0)}
                  className="w-24"
                />
                <Select
                  aria-label="יחידת זמן"
                  className="w-32"
                  value={delayUnit}
                  onChange={(v) => setDelayUnit(v as "minutes" | "hours" | "days")}
                  options={[
                    { value: "minutes", label: "דקות" },
                    { value: "hours", label: "שעות" },
                    { value: "days", label: "ימים" },
                  ]}
                />
              </div>
            </label>

            {index > 0 && (
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-xs text-neutral-500">תנאי דילוג</span>
                <Checkbox isSelected={skipEnabled} onChange={setSkipEnabled}>
                  דלג על המייל אם הנמען כבר פעל
                </Checkbox>
                {skipEnabled && (
                  <Select
                    aria-label="סוג אירוע לדילוג"
                    className="w-48"
                    value={skipEvent}
                    onChange={(v) => setSkipEvent(v as "opened" | "clicked")}
                    options={[
                      { value: "opened", label: "אם פתח את הקודם" },
                      { value: "clicked", label: "אם לחץ בקודם" },
                    ]}
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-neutral-500">תוכן המייל</p>
            <BlockEditor initialDoc={doc} onChange={setDoc} />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="danger-soft"
              onPress={() => {
                if (confirm("למחוק את המייל הזה?")) deleteStep({ id: step.id, sequenceId });
              }}
            >
              מחק מייל
            </Button>
            <div className="flex items-center gap-2">
              {savedAt && <span className="text-xs text-neutral-400">נשמר {savedAt}</span>}
              <Button variant="primary" onPress={save} isDisabled={saving}>
                {saving ? "שומר…" : "שמור מייל"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function unitLabel(u: "minutes" | "hours" | "days") {
  return u === "minutes" ? "דקות" : u === "hours" ? "שעות" : "ימים";
}
