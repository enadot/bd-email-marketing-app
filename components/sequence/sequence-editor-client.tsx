"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { Select } from "@/components/ui/select";
import { PlusIcon } from "@/components/dashboard/icons";
import { StepCard, type StepData } from "./step-card";
import {
  updateSequenceMeta,
  addStep,
  deleteSequence,
} from "@/lib/actions/sequence";

type Status = "draft" | "active" | "paused" | "archived";

const STATUS_LABEL: Record<Status, string> = {
  draft: "טיוטה",
  active: "פעילה",
  paused: "מושהית",
  archived: "בארכיון",
};

export function SequenceEditorClient({
  id,
  name: initialName,
  status: initialStatus,
  steps,
}: {
  id: string;
  name: string;
  status: Status;
  steps: StepData[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [busy, startBusy] = useTransition();

  function saveMeta(next: { name?: string; status?: Status }) {
    startBusy(async () => {
      await updateSequenceMeta({ id, ...next });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== initialName && saveMeta({ name })}
          className="max-w-xs text-lg font-semibold"
        />
        <div className="flex items-center gap-2">
          <Select
            aria-label="סטטוס הסדרה"
            className="w-36"
            value={status}
            onChange={(v) => {
              const s = v as Status;
              setStatus(s);
              saveMeta({ status: s });
            }}
            options={(Object.keys(STATUS_LABEL) as Status[]).map((s) => ({
              value: s,
              label: STATUS_LABEL[s],
            }))}
          />
          <Button variant="outline" onPress={() => router.push("/sequences")}>
            חזרה
          </Button>
          <Button
            variant="danger-soft"
            onPress={() => {
              if (confirm("למחוק את כל הסדרה?")) deleteSequence(id);
            }}
          >
            מחק סדרה
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} sequenceId={id} index={i} />
        ))}
      </div>

      <Button
        variant="outline"
        onPress={() => startBusy(async () => {
          await addStep(id);
          router.refresh();
        })}
        isDisabled={busy}
      >
        <PlusIcon /> הוסף מייל
      </Button>
    </div>
  );
}
