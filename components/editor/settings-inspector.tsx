"use client";

import { Input } from "@heroui/react";
import { Select } from "@/components/ui/select";
import type { EmailSettings } from "@/lib/blocks/schema";

const FONTS = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
  { value: "'Courier New', monospace", label: "Courier New" },
];

// Global design settings for the whole email (shown when no block is selected).
export function SettingsInspector({
  settings,
  onChange,
}: {
  settings: EmailSettings;
  onChange: (patch: Partial<EmailSettings>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-semibold text-neutral-700 dark:text-neutral-200">עיצוב המייל</p>

      <ColorField
        label="צבע מותג (כפתורים וקישורים)"
        value={settings.brandColor}
        onChange={(brandColor) => onChange({ brandColor })}
      />
      <ColorField
        label="צבע טקסט"
        value={settings.textColor}
        onChange={(textColor) => onChange({ textColor })}
      />
      <ColorField
        label="רקע המייל"
        value={settings.backgroundColor}
        onChange={(backgroundColor) => onChange({ backgroundColor })}
      />
      <ColorField
        label="רקע התוכן"
        value={settings.contentBackground}
        onChange={(contentBackground) => onChange({ contentBackground })}
      />

      <Select
        label="פונט"
        value={settings.fontFamily}
        onChange={(fontFamily) => onChange({ fontFamily })}
        options={FONTS}
      />

      <Select
        label="כיוון"
        value={settings.direction}
        onChange={(v) => onChange({ direction: v as "rtl" | "ltr" })}
        options={[
          { value: "rtl", label: "ימין לשמאל (עברית)" },
          { value: "ltr", label: "שמאל לימין (English)" },
        ]}
      />

      <label className="flex flex-col gap-1">
        <span className="text-xs text-neutral-500">Preheader — טקסט תצוגה בתיבת הדואר</span>
        <Input
          value={settings.preheader}
          onChange={(e) => onChange({ preheader: e.target.value })}
          placeholder="שורה קצרה שמופיעה ליד הנושא"
        />
      </label>
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-500">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={toHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-neutral-200 bg-transparent p-0.5 dark:border-neutral-700"
          aria-label={label}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      </div>
    </label>
  );
}

// <input type="color"> only accepts #rrggbb; pass through when already hex,
// otherwise fall back to black so the picker stays usable.
function toHex(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
}
