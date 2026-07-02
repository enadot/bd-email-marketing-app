"use client";

import { useEffect, useState } from "react";
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
import { Button, useOverlayState } from "@heroui/react";
import {
  defaultBlock,
  type Block,
  type BlockType,
  type EmailDocument,
  type EmailSettings,
} from "@/lib/blocks/schema";
import { SortableBlock } from "./sortable-block";
import { BlockInspector } from "./block-inspector";
import { SettingsInspector } from "./settings-inspector";
import { PreviewModal } from "./preview-modal";
import { useDocHistory } from "./use-history";

const PALETTE: { type: BlockType; label: string; icon: string }[] = [
  { type: "heading", label: "כותרת", icon: "H" },
  { type: "text", label: "טקסט", icon: "¶" },
  { type: "image", label: "תמונה", icon: "🖼" },
  { type: "button", label: "כפתור", icon: "⬛" },
  { type: "callout", label: "הדגשה", icon: "💡" },
  { type: "list", label: "רשימה", icon: "≡" },
  { type: "social", label: "רשתות", icon: "@" },
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
  const { doc, update: applyUpdate, undo, redo, canUndo, canRedo } = useDocHistory(initialDoc);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const previewOverlay = useOverlayState();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const update = applyUpdate;

  // Single propagation point for edits, undo and redo alike.
  useEffect(() => {
    if (doc !== initialDoc) onChange?.(doc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  // Global undo/redo keyboard shortcuts (⌘Z / ⌘⇧Z / Ctrl+Y).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  function addBlock(type: BlockType) {
    const block = defaultBlock(type, newId());
    const at = selectedId
      ? doc.blocks.findIndex((b) => b.id === selectedId) + 1
      : doc.blocks.length;
    const blocks = [...doc.blocks];
    blocks.splice(at || doc.blocks.length, 0, block);
    update({ ...doc, blocks });
    setSelectedId(block.id);
  }

  function patchBlock(id: string, patch: Partial<Block>, opts?: { coalesce?: boolean }) {
    update(
      {
        ...doc,
        blocks: doc.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
      },
      opts,
    );
  }

  function patchSettings(patch: Partial<EmailSettings>) {
    update({ ...doc, settings: { ...doc.settings, ...patch } });
  }

  function deleteBlock(id: string) {
    update({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }

  function duplicateBlock(id: string) {
    const index = doc.blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const copy = { ...doc.blocks[index], id: newId() } as Block;
    const blocks = [...doc.blocks];
    blocks.splice(index + 1, 0, copy);
    update({ ...doc, blocks });
    setSelectedId(copy.id);
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const from = doc.blocks.findIndex((b) => b.id === id);
    const to = from + dir;
    if (from === -1 || to < 0 || to >= doc.blocks.length) return;
    update({ ...doc, blocks: arrayMove(doc.blocks, from, to) });
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
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
        <ToolbarButton onClick={undo} disabled={!canUndo} label="בטל (Ctrl+Z)">
          ↶ בטל
        </ToolbarButton>
        <ToolbarButton onClick={redo} disabled={!canRedo} label="בצע שוב (Ctrl+Shift+Z)">
          ↷ שוב
        </ToolbarButton>
        <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs text-neutral-400">{doc.blocks.length} בלוקים</span>
        <div className="flex-1" />
        <Button variant="outline" onPress={previewOverlay.open}>
          👁 תצוגה מקדימה ובדיקה
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Palette */}
        <div className="flex w-32 shrink-0 flex-col gap-2">
          <p className="text-xs font-semibold text-neutral-500">הוסף בלוק</p>
          {PALETTE.map((p) => (
            <button
              key={p.type}
              onClick={() => addBlock(p.type)}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors hover:border-blue-400 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <span className="w-5 text-center">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div
          className="min-h-[480px] flex-1 rounded-xl p-6"
          style={{ backgroundColor: doc.settings.backgroundColor, fontFamily: doc.settings.fontFamily }}
          dir={doc.settings.direction}
          onClick={() => setSelectedId(null)}
        >
          <div
            className="mx-auto max-w-[600px] rounded-xl p-6"
            style={{ backgroundColor: doc.settings.contentBackground }}
            onClick={(e) => e.stopPropagation()}
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
                        onDuplicate={() => duplicateBlock(block.id)}
                        onMove={(dir) => moveBlock(block.id, dir)}
                        onPatch={(patch, opts) => patchBlock(block.id, patch, opts)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Inspector: selected block, or global design settings */}
        <div className="w-72 shrink-0 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          {selected ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="self-start text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                → חזרה לעיצוב הכללי
              </button>
              <BlockInspector
                block={selected}
                onChange={(patch) => patchBlock(selected.id, patch)}
              />
            </div>
          ) : (
            <SettingsInspector settings={doc.settings} onChange={patchSettings} />
          )}
        </div>
      </div>

      <PreviewModal doc={doc} overlay={previewOverlay} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {children}
    </button>
  );
}
