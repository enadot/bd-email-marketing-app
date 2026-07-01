import {
  Body,
  Button,
  Container,
  Hr,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import type { Block, EmailDocument } from "@/lib/blocks/schema";
import { applyMergeTags } from "@/lib/blocks/merge";

type RenderData = Record<string, unknown>;

function BlockView({
  block,
  settings,
  data,
}: {
  block: Block;
  settings: EmailDocument["settings"];
  data: RenderData;
}) {
  const align = "align" in block ? block.align : "right";

  switch (block.type) {
    case "heading": {
      const sizes = { 1: "28px", 2: "22px", 3: "18px" } as const;
      const tag = `h${block.level}` as "h1" | "h2" | "h3";
      return (
        <Heading
          as={tag}
          style={{
            color: settings.textColor,
            textAlign: align,
            fontSize: sizes[block.level],
            margin: "0 0 12px",
          }}
        >
          {applyMergeTags(block.text, data)}
        </Heading>
      );
    }
    case "text":
      return (
        <Text
          style={{
            color: settings.textColor,
            textAlign: align,
            fontSize: "16px",
            lineHeight: "1.6",
            margin: "0 0 12px",
          }}
        >
          {applyMergeTags(block.text, data)}
        </Text>
      );
    case "image": {
      const img = (
        <Img
          src={block.src}
          alt={block.alt}
          width={block.width}
          style={{ maxWidth: "100%", borderRadius: "6px" }}
        />
      );
      return (
        <Section style={{ textAlign: "center", margin: "0 0 12px" }}>
          {block.href ? <Link href={block.href}>{img}</Link> : img}
        </Section>
      );
    }
    case "button":
      return (
        <Section style={{ textAlign: align, margin: "16px 0" }}>
          <Button
            href={applyMergeTags(block.url, data)}
            style={{
              backgroundColor: settings.brandColor,
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {applyMergeTags(block.text, data)}
          </Button>
        </Section>
      );
    case "divider":
      return <Hr style={{ borderColor: "#e4e4e7", margin: "16px 0" }} />;
    case "spacer":
      return <div style={{ height: `${block.height}px` }} />;
  }
}

export function EmailDocumentView({
  doc,
  data = {},
  unsubscribeUrl,
}: {
  doc: EmailDocument;
  data?: RenderData;
  unsubscribeUrl?: string;
}) {
  const { settings, blocks } = doc;
  return (
    <Html dir={settings.direction} lang={settings.direction === "rtl" ? "he" : "en"}>
      <Body
        style={{
          backgroundColor: settings.backgroundColor,
          fontFamily: settings.fontFamily,
          margin: 0,
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: settings.contentBackground,
            maxWidth: "600px",
            margin: "0 auto",
            padding: "32px",
            borderRadius: "12px",
          }}
        >
          {blocks.map((block) => (
            <BlockView key={block.id} block={block} settings={settings} data={data} />
          ))}

          {unsubscribeUrl && (
            <>
              <Hr style={{ borderColor: "#e4e4e7", margin: "24px 0 12px" }} />
              <Text style={{ fontSize: "12px", color: "#a1a1aa", textAlign: "center" }}>
                <Link href={unsubscribeUrl} style={{ color: "#a1a1aa" }}>
                  הסרה מרשימת התפוצה
                </Link>
              </Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}

// react-email's preview server picks up a default export per file.
export default function Preview() {
  const sample: EmailDocument = {
    settings: {
      backgroundColor: "#f4f4f5",
      contentBackground: "#ffffff",
      brandColor: "#3b82f6",
      textColor: "#18181b",
      fontFamily: "Arial, sans-serif",
      direction: "rtl",
    },
    blocks: [
      { id: "1", type: "heading", text: "שלום {{firstName}} 👋", level: 1, align: "right" },
      { id: "2", type: "text", text: "תודה שנרשמת! הנה מה שמחכה לך.", align: "right" },
      { id: "3", type: "button", text: "בואו נתחיל", url: "https://example.com", align: "center" },
    ],
  };
  return <EmailDocumentView doc={sample} data={{ firstName: "אביב" }} unsubscribeUrl="https://example.com/u" />;
}
