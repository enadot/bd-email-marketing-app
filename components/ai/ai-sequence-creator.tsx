"use client";

import { useState, useTransition } from "react";
import { Button, Card, Input, TextArea } from "@heroui/react";
import {
  generateSequenceDraft,
  regenerateStepDraft,
  createSequenceFromDraft,
} from "@/lib/actions/ai";
import type { AiSequence, BriefInput } from "@/lib/ai/schema";

type Phase = "brief" | "review";

export function AiSequenceCreator() {
  const [phase, setPhase] = useState<Phase>("brief");
  const [brief, setBrief] = useState<BriefInput>({
    topic: "",
    audience: "",
    tone: "",
    emailCount: 4,
    goal: "",
    ctaUrl: "",
    brandNotes: "",
    language: "he",
  });
  const [sequence, setSequence] = useState<AiSequence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  function generate() {
    setError(null);
    startBusy(async () => {
      const res = await generateSequenceDraft(brief);
      if (!res.ok) return setError(res.error);
      setSequence(res.sequence);
      setPhase("review");
    });
  }

  function regenerate(index: number) {
    const note = prompt("מה לשנות במייל הזה?") ?? "";
    setError(null);
    startBusy(async () => {
      const res = await regenerateStepDraft(brief, index, note);
      if (!res.ok) return setError(res.error);
      setSequence(res.sequence);
    });
  }

  function approve() {
    if (!sequence) return;
    setError(null);
    startBusy(async () => {
      await createSequenceFromDraft({ brief, sequence });
    });
  }

  function patchStep(i: number, patch: Partial<AiSequence["steps"][number]>) {
    if (!sequence) return;
    setSequence({
      ...sequence,
      steps: sequence.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  }

  if (phase === "brief") {
    return (
      <BriefForm
        brief={brief}
        setBrief={setBrief}
        onGenerate={generate}
        busy={busy}
        error={error}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">אישור הסדרה</h1>
          <p className="text-sm text-neutral-500">
            ערוך, חולל מחדש מיילים בודדים, ואשר כדי לשמור.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onPress={() => setPhase("brief")} isDisabled={busy}>
            חזרה לבריף
          </Button>
          <Button variant="primary" onPress={approve} isDisabled={busy}>
            {busy ? "שומר…" : "אשר ושמור"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {sequence && (
        <Card className="p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-neutral-500">שם הסדרה</span>
            <Input
              value={sequence.name}
              onChange={(e) => setSequence({ ...sequence, name: e.target.value })}
            />
          </label>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {sequence?.steps.map((step, i) => (
          <Card key={i} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
                מייל {i + 1}
              </span>
              <Button variant="outline" onPress={() => regenerate(i)} isDisabled={busy}>
                ✨ חולל מחדש
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_120px]">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-neutral-500">נושא</span>
                <Input value={step.subject} onChange={(e) => patchStep(i, { subject: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-neutral-500">Preheader</span>
                <Input
                  value={step.preheader ?? ""}
                  onChange={(e) => patchStep(i, { preheader: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-neutral-500">השהיה (ימים)</span>
                <Input
                  type="number"
                  value={String(step.delayDays)}
                  onChange={(e) => patchStep(i, { delayDays: Number(e.target.value) || 0 })}
                />
              </label>
            </div>

            <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
              <p className="font-semibold">{step.heading}</p>
              {step.paragraphs.map((p, idx) => (
                <p key={idx} className="mt-1 text-neutral-600 dark:text-neutral-300">
                  {p}
                </p>
              ))}
              {step.cta && (
                <span className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-1.5 text-xs text-white">
                  {step.cta.text}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BriefForm({
  brief,
  setBrief,
  onGenerate,
  busy,
  error,
}: {
  brief: BriefInput;
  setBrief: (b: BriefInput) => void;
  onGenerate: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">סדרה חדשה עם AI</h1>
        <p className="text-sm text-neutral-500">
          כתוב בריף קצר ו-Claude יבנה את כל הסדרה לאישורך.
        </p>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-neutral-500">נושא / מטרת הסדרה *</span>
          <TextArea
            value={brief.topic}
            onChange={(e) => setBrief({ ...brief, topic: e.target.value })}
            rows={3}
            placeholder="לדוגמה: סדרת onboarding למשתמשים חדשים באפליקציית כושר"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="קהל יעד">
            <Input
              value={brief.audience ?? ""}
              onChange={(e) => setBrief({ ...brief, audience: e.target.value })}
              placeholder="מי הנמענים?"
            />
          </Field>
          <Field label="טון">
            <Input
              value={brief.tone ?? ""}
              onChange={(e) => setBrief({ ...brief, tone: e.target.value })}
              placeholder="ידידותי / מקצועי / שיווקי"
            />
          </Field>
          <Field label="מטרה עסקית / CTA">
            <Input
              value={brief.goal ?? ""}
              onChange={(e) => setBrief({ ...brief, goal: e.target.value })}
              placeholder="מה הפעולה הרצויה?"
            />
          </Field>
          <Field label="כתובת CTA (URL)">
            <Input
              value={brief.ctaUrl ?? ""}
              onChange={(e) => setBrief({ ...brief, ctaUrl: e.target.value })}
              placeholder="https://"
            />
          </Field>
          <Field label="מספר מיילים">
            <Input
              type="number"
              value={String(brief.emailCount)}
              onChange={(e) =>
                setBrief({ ...brief, emailCount: Math.min(10, Math.max(1, Number(e.target.value) || 1)) })
              }
            />
          </Field>
          <Field label="שפה">
            <Input
              value={brief.language}
              onChange={(e) => setBrief({ ...brief, language: e.target.value })}
            />
          </Field>
        </div>

        <Field label="הערות מותג / מידע נוסף">
          <TextArea
            value={brief.brandNotes ?? ""}
            onChange={(e) => setBrief({ ...brief, brandNotes: e.target.value })}
            rows={3}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          variant="primary"
          onPress={onGenerate}
          isDisabled={busy || brief.topic.trim().length < 3}
        >
          {busy ? "Claude כותב…" : "✨ צור סדרה"}
        </Button>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
