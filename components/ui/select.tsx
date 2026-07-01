"use client";

import { Select as HSelect, ListBox, ListBoxItem } from "@heroui/react";

export type SelectOption = { value: string; label: string };

// Thin wrapper over HeroUI's compound Select for the common single-select case.
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "בחר…",
  className,
  "aria-label": ariaLabel,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      {label && <span className="text-xs text-neutral-500">{label}</span>}
      <HSelect
        aria-label={ariaLabel ?? label ?? "select"}
        selectedKey={value || null}
        onSelectionChange={(k) => onChange(k == null ? "" : String(k))}
        placeholder={placeholder}
      >
        <HSelect.Trigger>
          <HSelect.Value />
          <HSelect.Indicator />
        </HSelect.Trigger>
        <HSelect.Popover>
          <ListBox>
            {options.map((o) => (
              <ListBoxItem key={o.value} id={o.value}>
                {o.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </HSelect.Popover>
      </HSelect>
    </div>
  );
}
