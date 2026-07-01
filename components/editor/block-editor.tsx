"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  defaultBlock,
  type Block,
  type BlockType,
  type EmailDocument,
} from "@/lib/blocks/schema";
import { SortableBlock } from "./sortable-block";
import { BlockInspector } from "./block-inspector";

const PALETTE: { type: BlockType; label: string; icon: string }[] = [
  { type: "heading", label: "כותרת", icon: "H" },
  { type: "text", label: "טקסט", icon: "¶" },
  { type: "image", label: "תמונה", icon: "🖼" },
  { type: "button", label: "כפתור", icon: "⬛" },
  { type: "divider", label: "קו", icon: "—" },
  { type: "spacer", label: "רווח", icon: "↕" },
];

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function BlockEditor({
  initialDoc,
  onChange,
}: {
  initialDoc: EmailDocument;
  onChange?: (doc: EmailDocument) => void;
}) {
  const [doc, setDoc] = useState<EmailDocument>(initialDoc);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function update(next: EmailDocument) {
    setDoc(next);
    onChange?.(next);
  }

  function addBlock(type: BlockType) {
    const block = defaultBlock(type, newId());
    update({ ...doc, blocks: [...doc.blocks, block] });
    setSelectedId(block.id);
  }

  function patchBlock(id: string, patch: Partial<Block>) {
    update({
      ...doc,
      blocks: doc.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
    });
  }

  function deleteBlock(id: string) {
    update({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = doc.blocks.findIndex((b) => b.id === active.id);
    const newIndex = doc.blocks.findIndex((b) => b.id === over.id);
    update({ ...doc, blocks: arrayMove(doc.blocks, oldIndex, newIndex) });
  }

  const selected = doc.blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <div className="flex gap-4">
      {/* Palette */}
      <div className="flex w-32 shrink-0 flex-col gap-2">
        <p className="text-xs font-semibold text-neutral-500">הוסף בלוק</p>
        {PALETTE.map((p) => (
          <button
            key={p.type}
            onClick={() => addBlock(p.type)}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:border-blue-400 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        className="min-h-[480px] flex-1 rounded-xl p-6"
        style={{ backgroundColor: doc.settings.backgroundColor }}
        dir={doc.settings.direction}
      >
        <div
          className="mx-auto max-w-[600px] rounded-xl p-6"
          style={{ backgroundColor: doc.settings.contentBackground }}
        >
          {doc.blocks.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-400">
              הוסף בלוקים מהתפריט כדי לבנות את המייל
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={doc.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1">
                  {doc.blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      settings={doc.settings}
                      selected={block.id === selectedId}
                      onSelect={() => setSelectedId(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Inspector */}
      <div className="w-64 shrink-0 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        {selected ? (
          <BlockInspector
            block={selected}
            onChange={(patch) => patchBlock(selected.id, patch)}
          />
        ) : (
          <p className="text-sm text-neutral-400">בחר בלוק כדי לערוך אותו</p>
        )}
      </div>
    </div>
  );
}
