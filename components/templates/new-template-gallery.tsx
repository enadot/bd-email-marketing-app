"use client";

import { useMemo, useState, useTransition } from "react";
import { Button, Card, Chip, Input, Modal, useOverlayState } from "@heroui/react";
import { GALLERY } from "@/lib/blocks/gallery";
import { emptyDocument } from "@/lib/blocks/schema";
import { createTemplate } from "@/lib/actions/template";
import { DocThumb } from "@/components/editor/doc-preview";

const CATEGORIES = ["הכל", "פתיחה", "שיווק", "עדכונים", "עסקאות"] as const;

// "New template" flow: opens a gallery of professionally designed starting
// points (plus a blank canvas), with live scaled-down previews.
export function NewTemplateGallery() {
  const overlay = useOverlayState();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("הכל");
  const [selected, setSelected] = useState<string>("blank");
  const [name, setName] = useState("");
  const [creating, startCreating] = useTransition();

  const items = useMemo(
    () => (category === "הכל" ? GALLERY : GALLERY.filter((t) => t.category === category)),
    [category],
  );

  function create() {
    startCreating(async () => {
      const fd = new FormData();
      fd.set("name", name);
      if (selected !== "blank") fd.set("gallery", selected);
      await createTemplate(fd);
    });
  }

  return (
    <>
      <Button variant="primary" onPress={overlay.open}>
        תבנית חדשה
      </Button>

      <Modal.Root state={overlay}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size="lg" className="max-w-4xl">
            <Modal.Dialog aria-label="בחירת תבנית">
              <Modal.Header>
                <Modal.Heading>ממה מתחילים?</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4" dir="rtl">
                {/* Category filter */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Chip
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`cursor-pointer ${
                        category === c ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {c}
                    </Chip>
                  ))}
                </div>

                {/* Gallery grid */}
                <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto p-1 md:grid-cols-3">
                  <GalleryCard
                    label="דף ריק"
                    description="התחלה נקייה מאפס"
                    selected={selected === "blank"}
                    onSelect={() => setSelected("blank")}
                  >
                    <DocThumb doc={emptyDocument} height={140} />
                  </GalleryCard>
                  {items.map((t) => (
                    <GalleryCard
                      key={t.slug}
                      label={t.name}
                      description={t.description}
                      selected={selected === t.slug}
                      onSelect={() => setSelected(t.slug)}
                    >
                      <DocThumb doc={t.doc} height={140} />
                    </GalleryCard>
                  ))}
                </div>
              </Modal.Body>
              <Modal.Footer className="flex items-center gap-2" dir="rtl">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="שם התבנית (אופציונלי)"
                  className="max-w-xs"
                />
                <div className="flex-1" />
                <Button variant="outline" onPress={overlay.close}>
                  ביטול
                </Button>
                <Button variant="primary" onPress={create} isDisabled={creating}>
                  {creating ? "יוצר…" : "יצירת תבנית"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </>
  );
}

function GalleryCard({
  label,
  description,
  selected,
  onSelect,
  children,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer overflow-hidden p-2 transition-all ${
        selected ? "ring-2 ring-blue-500" : "hover:shadow-md"
      }`}
    >
      {children}
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="text-xs text-neutral-500">{description}</p>
    </Card>
  );
}
