"use client";

import { Input, TextArea } from "@heroui/react";
import { Select } from "@/components/ui/select";
import type { Block } from "@/lib/blocks/schema";

// Field-level editor for the currently selected block.
export function BlockInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-semibold text-neutral-700 dark:text-neutral-200">
        עריכת בלוק: {LABELS[block.type]}
      </p>

      {(block.type === "heading" || block.type === "text") && (
        <>
          <Field label="טקסט">
            <TextArea
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
              rows={4}
            />
          </Field>
          <Field label="יישור">
            <AlignButtons
              value={block.align}
              onChange={(align) => onChange({ align } as Partial<Block>)}
            />
          </Field>
        </>
      )}

      {block.type === "heading" && (
        <Select
          label="גודל"
          value={String(block.level)}
          onChange={(v) => onChange({ level: Number(v) as 1 | 2 | 3 } as Partial<Block>)}
          options={[
            { value: "1", label: "H1 — גדול" },
            { value: "2", label: "H2 — בינוני" },
            { value: "3", label: "H3 — קטן" },
          ]}
        />
      )}

      {block.type === "image" && (
        <>
          <Field label="כתובת תמונה (URL)">
            <Input value={block.src} onChange={(e) => onChange({ src: e.target.value } as Partial<Block>)} />
          </Field>
          <Field label="טקסט חלופי (alt)">
            <Input value={block.alt} onChange={(e) => onChange({ alt: e.target.value } as Partial<Block>)} />
          </Field>
          <Field label="קישור בלחיצה (אופציונלי)">
            <Input
              value={block.href ?? ""}
              onChange={(e) => onChange({ href: e.target.value } as Partial<Block>)}
            />
          </Field>
        </>
      )}

      {block.type === "button" && (
        <>
          <Field label="טקסט הכפתור">
            <Input value={block.text} onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)} />
          </Field>
          <Field label="קישור (URL)">
            <Input value={block.url} onChange={(e) => onChange({ url: e.target.value } as Partial<Block>)} />
          </Field>
          <Field label="יישור">
            <AlignButtons
              value={block.align}
              onChange={(align) => onChange({ align } as Partial<Block>)}
            />
          </Field>
        </>
      )}

      {block.type === "spacer" && (
        <Field label="גובה (px)">
          <Input
            type="number"
            value={String(block.height)}
            onChange={(e) => onChange({ height: Number(e.target.value) || 0 } as Partial<Block>)}
          />
        </Field>
      )}

      {block.type === "divider" && (
        <p className="text-neutral-500">לקו מפריד אין הגדרות.</p>
      )}
    </div>
  );
}

const LABELS: Record<Block["type"], string> = {
  heading: "כותרת",
  text: "טקסט",
  image: "תמונה",
  button: "כפתור",
  divider: "קו מפריד",
  spacer: "רווח",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

function AlignButtons({
  value,
  onChange,
}: {
  value: "left" | "center" | "right";
  onChange: (v: "left" | "center" | "right") => void;
}) {
  const opts: { v: "right" | "center" | "left"; label: string }[] = [
    { v: "right", label: "ימין" },
    { v: "center", label: "מרכז" },
    { v: "left", label: "שמאל" },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-lg border px-2 py-1 text-xs ${
            value === o.v
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
