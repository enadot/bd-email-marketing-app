import { SOCIAL_LABELS, type Block, type EmailDocument, type EmailSettings } from "@/lib/blocks/schema";

// ─────────────────────────────────────────────────────────────
// Static, browser-side approximation of the rendered email.
// Shared by the editor canvas, the template gallery thumbnails
// and the templates list. Pure markup — safe in Server Components.
// ─────────────────────────────────────────────────────────────

export function BlockStatic({ block, settings }: { block: Block; settings: EmailSettings }) {
  const align = "align" in block ? block.align : "right";

  switch (block.type) {
    case "heading":
      return (
        <p
          style={{ textAlign: align, color: block.color ?? settings.textColor }}
          className={`font-bold ${block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-lg"}`}
        >
          {block.text}
        </p>
      );
    case "text":
      return (
        <p
          style={{
            textAlign: align,
            color: block.color ?? settings.textColor,
            fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
          }}
          className="whitespace-pre-wrap text-sm leading-relaxed"
        >
          {block.text}
        </p>
      );
    case "image":
      return (
        <div style={{ textAlign: align }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            style={{
              borderRadius: `${block.borderRadius ?? 6}px`,
              width: block.width ? `${block.width}px` : undefined,
            }}
            className="inline-block max-h-48 max-w-full"
          />
        </div>
      );
    case "button":
      return (
        <div style={{ textAlign: align }}>
          <span
            style={{
              backgroundColor: block.backgroundColor ?? settings.brandColor,
              color: block.textColor ?? "#ffffff",
              borderRadius: `${block.borderRadius ?? 8}px`,
              ...(block.fullWidth ? { display: "block", textAlign: "center" as const } : {}),
            }}
            className="inline-block px-5 py-2 text-sm font-semibold"
          >
            {block.text}
          </span>
        </div>
      );
    case "divider":
      return <hr style={{ borderColor: block.color ?? "#e4e4e7" }} />;
    case "spacer":
      return <div style={{ height: block.height }} />;
    case "callout":
      return (
        <div
          style={{ backgroundColor: block.backgroundColor, textAlign: align }}
          className="rounded-lg px-4 py-3"
        >
          <p style={{ color: block.textColor }} className="text-sm leading-relaxed">
            {block.emoji && `${block.emoji} `}
            {block.text}
          </p>
        </div>
      );
    case "list":
      return (
        <ul style={{ textAlign: align, color: settings.textColor }} className="flex flex-col gap-1 text-sm">
          {block.items.map((item, i) => (
            <li key={i}>•&nbsp;&nbsp;{item}</li>
          ))}
        </ul>
      );
    case "social":
      return (
        <div style={{ textAlign: align }} className="text-sm">
          {block.links.map((link, i) => (
            <span key={i}>
              {i > 0 && <span className="text-neutral-300">&nbsp;&nbsp;·&nbsp;&nbsp;</span>}
              <span style={{ color: settings.brandColor }} className="font-semibold">
                {SOCIAL_LABELS[link.network]}
              </span>
            </span>
          ))}
        </div>
      );
  }
}

// The full email shell rendered statically at natural (600px) width.
export function DocStatic({ doc }: { doc: EmailDocument }) {
  return (
    <div
      dir={doc.settings.direction}
      style={{ backgroundColor: doc.settings.backgroundColor, fontFamily: doc.settings.fontFamily }}
      className="p-6"
    >
      <div
        style={{ backgroundColor: doc.settings.contentBackground }}
        className="mx-auto flex w-[600px] max-w-full flex-col gap-3 rounded-xl p-8"
      >
        {doc.blocks.map((block) => (
          <BlockStatic key={block.id} block={block} settings={doc.settings} />
        ))}
      </div>
    </div>
  );
}

// A scaled-down live thumbnail (e.g. gallery cards, templates list).
export function DocThumb({ doc, height = 180 }: { doc: EmailDocument; height?: number }) {
  return (
    <div
      style={{ height, backgroundColor: doc.settings.backgroundColor }}
      className="pointer-events-none select-none overflow-hidden rounded-lg"
      aria-hidden
    >
      <div style={{ transform: "scale(0.42)", transformOrigin: "top center", width: "238%", marginInlineStart: "-69%" }}>
        <DocStatic doc={doc} />
      </div>
    </div>
  );
}
