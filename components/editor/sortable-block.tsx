"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, EmailSettings } from "@/lib/blocks/schema";

// A single block rendered on the editor canvas, draggable + selectable.
export function SortableBlock({
  block,
  settings,
  selected,
  onSelect,
  onDelete,
}: {
  block: Block;
  settings: EmailSettings;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-lg border p-2 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-transparent hover:border-neutral-300"
      }`}
    >
      <div className="absolute -top-2 left-2 z-10 hidden gap-1 group-hover:flex">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded bg-neutral-800 px-2 py-0.5 text-xs text-white"
          onClick={(e) => e.stopPropagation()}
          aria-label="גרור"
        >
          ⠿
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded bg-red-600 px-2 py-0.5 text-xs text-white"
          aria-label="מחק"
        >
          ✕
        </button>
      </div>
      <BlockPreview block={block} settings={settings} />
    </div>
  );
}

function BlockPreview({ block, settings }: { block: Block; settings: EmailSettings }) {
  const align = "align" in block ? block.align : "right";
  switch (block.type) {
    case "heading":
      return (
        <p
          style={{ textAlign: align, color: settings.textColor }}
          className={`font-bold ${block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-lg"}`}
        >
          {block.text}
        </p>
      );
    case "text":
      return (
        <p style={{ textAlign: align, color: settings.textColor }} className="text-sm leading-relaxed">
          {block.text}
        </p>
      );
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={block.src} alt={block.alt} className="mx-auto max-h-40 rounded" />;
    case "button":
      return (
        <div style={{ textAlign: align }}>
          <span
            style={{ backgroundColor: settings.brandColor }}
            className="inline-block rounded-lg px-5 py-2 text-sm font-semibold text-white"
          >
            {block.text}
          </span>
        </div>
      );
    case "divider":
      return <hr className="border-neutral-200" />;
    case "spacer":
      return (
        <div
          style={{ height: block.height }}
          className="flex items-center justify-center text-xs text-neutral-300"
        >
          רווח {block.height}px
        </div>
      );
  }
}
