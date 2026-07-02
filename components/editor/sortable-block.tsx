"use client";

import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, EmailSettings } from "@/lib/blocks/schema";
import { BlockStatic } from "./doc-preview";

// A single block rendered on the editor canvas: draggable, selectable, and —
// for text-bearing blocks — editable inline, right on the canvas.
export function SortableBlock({
  block,
  settings,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
  onPatch,
}: {
  block: Block;
  settings: EmailSettings;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
  onPatch: (patch: Partial<Block>, opts?: { coalesce?: boolean }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const inlineEditable =
    selected &&
    (block.type === "heading" || block.type === "text" || block.type === "callout");

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-lg border p-2 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900"
          : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
      }`}
    >
      {/* Hover / selection toolbar */}
      <div
        className={`absolute -top-3 left-2 z-10 gap-1 ${selected ? "flex" : "hidden group-hover:flex"}`}
      >
        <ToolButton {...attributes} {...listeners} className="cursor-grab" label="גרור">
          ⠿
        </ToolButton>
        <ToolButton label="למעלה" onClick={() => onMove(-1)}>
          ↑
        </ToolButton>
        <ToolButton label="למטה" onClick={() => onMove(1)}>
          ↓
        </ToolButton>
        <ToolButton label="שכפל" onClick={onDuplicate}>
          ⧉
        </ToolButton>
        <ToolButton label="מחק" onClick={onDelete} className="!bg-red-600">
          ✕
        </ToolButton>
      </div>

      {inlineEditable ? (
        <InlineText block={block} settings={settings} onPatch={onPatch} />
      ) : (
        <BlockStatic block={block} settings={settings} />
      )}
    </div>
  );
}

function ToolButton({
  label,
  className = "",
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`rounded bg-neutral-800 px-2 py-0.5 text-xs text-white hover:bg-neutral-700 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// Borderless auto-growing textarea that mimics the block's rendered look, so
// clicking a text block lets you type straight on the canvas.
function InlineText({
  block,
  settings,
  onPatch,
}: {
  block: Extract<Block, { type: "heading" | "text" | "callout" }>;
  settings: EmailSettings;
  onPatch: (patch: Partial<Block>, opts?: { coalesce?: boolean }) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Keep height in sync with content.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.text]);

  const typography =
    block.type === "heading"
      ? `font-bold ${block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-lg"}`
      : "text-sm leading-relaxed";

  const color =
    block.type === "callout"
      ? block.textColor
      : (block.color ?? settings.textColor);

  const body = (
    <textarea
      ref={ref}
      value={block.text}
      onChange={(e) => onPatch({ text: e.target.value } as Partial<Block>, { coalesce: true })}
      onClick={(e) => e.stopPropagation()}
      rows={1}
      style={{
        textAlign: block.align,
        color,
        fontSize: block.type === "text" && block.fontSize ? `${block.fontSize}px` : undefined,
      }}
      className={`w-full resize-none overflow-hidden border-none bg-transparent p-0 outline-none focus:ring-0 ${typography}`}
    />
  );

  if (block.type === "callout") {
    return (
      <div style={{ backgroundColor: block.backgroundColor }} className="rounded-lg px-4 py-3">
        <div className="flex items-start gap-1.5">
          {block.emoji && <span className="text-sm">{block.emoji}</span>}
          {body}
        </div>
      </div>
    );
  }
  return body;
}
