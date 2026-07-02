"use client";

import { Button, Input, TextArea } from "@heroui/react";
import { Select } from "@/components/ui/select";
import { SOCIAL_LABELS, SOCIAL_NETWORKS, type Block, type SocialNetwork } from "@/lib/blocks/schema";
import { ColorField } from "./settings-inspector";

const MERGE_TAGS = [
  { tag: "{{firstName}}", label: "שם פרטי" },
  { tag: "{{lastName}}", label: "שם משפחה" },
  { tag: "{{email}}", label: "אימייל" },
];

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

      {(block.type === "heading" || block.type === "text" || block.type === "callout") && (
        <>
          <Field label="טקסט">
            <TextArea
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
              rows={4}
            />
          </Field>
          <MergeTagChips
            onInsert={(tag) => onChange({ text: `${block.text}${tag}` } as Partial<Block>)}
          />
          <Field label="יישור">
            <AlignButtons
              value={block.align}
              onChange={(align) => onChange({ align } as Partial<Block>)}
            />
          </Field>
        </>
      )}

      {block.type === "heading" && (
        <>
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
          <ColorField
            label="צבע (ברירת מחדל: צבע הטקסט)"
            value={block.color ?? "#18181b"}
            onChange={(color) => onChange({ color } as Partial<Block>)}
          />
        </>
      )}

      {block.type === "text" && (
        <>
          <Field label="גודל גופן (px)">
            <Input
              type="number"
              value={String(block.fontSize ?? 16)}
              onChange={(e) =>
                onChange({ fontSize: Number(e.target.value) || 16 } as Partial<Block>)
              }
            />
          </Field>
          <ColorField
            label="צבע (ברירת מחדל: צבע הטקסט)"
            value={block.color ?? "#18181b"}
            onChange={(color) => onChange({ color } as Partial<Block>)}
          />
        </>
      )}

      {block.type === "callout" && (
        <>
          <Field label="אימוג׳י">
            <Input
              value={block.emoji}
              onChange={(e) => onChange({ emoji: e.target.value } as Partial<Block>)}
            />
          </Field>
          <ColorField
            label="צבע רקע"
            value={block.backgroundColor}
            onChange={(backgroundColor) => onChange({ backgroundColor } as Partial<Block>)}
          />
          <ColorField
            label="צבע טקסט"
            value={block.textColor}
            onChange={(textColor) => onChange({ textColor } as Partial<Block>)}
          />
        </>
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
              onChange={(e) => onChange({ href: e.target.value || undefined } as Partial<Block>)}
            />
          </Field>
          <Field label="רוחב (px, ריק = אוטומטי)">
            <Input
              type="number"
              value={block.width ? String(block.width) : ""}
              onChange={(e) =>
                onChange({ width: Number(e.target.value) || undefined } as Partial<Block>)
              }
            />
          </Field>
          <Field label="עיגול פינות (px)">
            <Input
              type="number"
              value={String(block.borderRadius ?? 6)}
              onChange={(e) =>
                onChange({ borderRadius: Number(e.target.value) || 0 } as Partial<Block>)
              }
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
          <ColorField
            label="צבע רקע (ברירת מחדל: צבע המותג)"
            value={block.backgroundColor ?? "#3b82f6"}
            onChange={(backgroundColor) => onChange({ backgroundColor } as Partial<Block>)}
          />
          <ColorField
            label="צבע טקסט"
            value={block.textColor ?? "#ffffff"}
            onChange={(textColor) => onChange({ textColor } as Partial<Block>)}
          />
          <Field label="עיגול פינות (px)">
            <Input
              type="number"
              value={String(block.borderRadius ?? 8)}
              onChange={(e) =>
                onChange({ borderRadius: Number(e.target.value) || 0 } as Partial<Block>)
              }
            />
          </Field>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(block.fullWidth)}
              onChange={(e) => onChange({ fullWidth: e.target.checked } as Partial<Block>)}
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-300">רוחב מלא</span>
          </label>
        </>
      )}

      {block.type === "list" && (
        <>
          <Field label="פריטים (שורה לכל פריט)">
            <TextArea
              value={block.items.join("\n")}
              onChange={(e) =>
                onChange({ items: e.target.value.split("\n") } as Partial<Block>)
              }
              rows={5}
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

      {block.type === "social" && (
        <>
          {block.links.map((link, i) => (
            <div key={i} className="flex flex-col gap-1 rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <Select
                  aria-label="רשת"
                  value={link.network}
                  onChange={(network) => {
                    const links = block.links.map((l, j) =>
                      j === i ? { ...l, network: network as SocialNetwork } : l,
                    );
                    onChange({ links } as Partial<Block>);
                  }}
                  options={SOCIAL_NETWORKS.map((n) => ({ value: n, label: SOCIAL_LABELS[n] }))}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange({ links: block.links.filter((_, j) => j !== i) } as Partial<Block>);
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                  aria-label="הסר קישור"
                >
                  ✕
                </button>
              </div>
              <Input
                value={link.url}
                onChange={(e) => {
                  const links = block.links.map((l, j) =>
                    j === i ? { ...l, url: e.target.value } : l,
                  );
                  onChange({ links } as Partial<Block>);
                }}
                placeholder="https://"
              />
            </div>
          ))}
          <Button
            variant="outline"
            onPress={() =>
              onChange({
                links: [...block.links, { network: "website", url: "https://" }],
              } as Partial<Block>)
            }
          >
            + הוסף קישור
          </Button>
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
        <ColorField
          label="צבע הקו"
          value={block.color ?? "#e4e4e7"}
          onChange={(color) => onChange({ color } as Partial<Block>)}
        />
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
  callout: "הדגשה",
  list: "רשימה",
  social: "רשתות חברתיות",
};

function MergeTagChips({ onInsert }: { onInsert: (tag: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[11px] text-neutral-400">הוסף תג:</span>
      {MERGE_TAGS.map((t) => (
        <button
          key={t.tag}
          type="button"
          onClick={() => onInsert(t.tag)}
          title={t.tag}
          className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:border-blue-400 hover:text-blue-600 dark:border-neutral-700 dark:text-neutral-300"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

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
