"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Input, Modal, type UseOverlayStateReturn } from "@heroui/react";
import type { EmailDocument } from "@/lib/blocks/schema";
import { previewEmailHtml, sendTestEmail } from "@/lib/actions/template";

type Tab = "desktop" | "mobile" | "source";

// Full-fidelity preview: renders the document through the real send pipeline
// (react-email → HTML) and shows it in an iframe, with a mobile width toggle,
// an HTML source view, and a test-send box.
export function PreviewModal({
  doc,
  overlay,
}: {
  doc: EmailDocument;
  overlay: UseOverlayStateReturn;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("desktop");
  const [rendering, startRendering] = useTransition();

  const [testTo, setTestTo] = useState("");
  const [sending, startSending] = useTransition();
  const [sendResult, setSendResult] = useState<{ ok: boolean; error?: string } | null>(null);

  // (Re)render whenever the modal opens with the current document.
  useEffect(() => {
    if (!overlay.isOpen) return;
    startRendering(async () => {
      setHtml(null);
      setSendResult(null);
      const { html } = await previewEmailHtml(doc);
      setHtml(html);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay.isOpen]);

  function copyHtml() {
    if (html) void navigator.clipboard.writeText(html);
  }

  function sendTest() {
    setSendResult(null);
    startSending(async () => {
      const result = await sendTestEmail({ doc, to: testTo });
      setSendResult(result);
    });
  }

  return (
    <Modal.Root state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="lg" className="max-w-4xl">
          <Modal.Dialog aria-label="תצוגה מקדימה">
            <Modal.Header>
              <Modal.Heading>תצוגה מקדימה</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3" dir="rtl">
              {/* View switcher */}
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: "desktop", label: "🖥️ דסקטופ" },
                    { key: "mobile", label: "📱 מובייל" },
                    { key: "source", label: "</> מקור HTML" },
                  ] as { key: Tab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      tab === t.key
                        ? "bg-blue-600 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                <div className="flex-1" />
                {tab === "source" && html && (
                  <Button variant="outline" onPress={copyHtml}>
                    העתק HTML
                  </Button>
                )}
              </div>

              {/* Preview surface */}
              <div className="max-h-[55vh] min-h-[320px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
                {rendering || !html ? (
                  <p className="py-24 text-center text-sm text-neutral-400">מרנדר את המייל…</p>
                ) : tab === "source" ? (
                  <pre className="overflow-auto p-4 text-left text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300" dir="ltr">
                    {html}
                  </pre>
                ) : (
                  <div className="flex justify-center py-4">
                    <iframe
                      title="תצוגה מקדימה של המייל"
                      srcDoc={html}
                      sandbox=""
                      style={{ width: tab === "mobile" ? 375 : 640, height: "60vh" }}
                      className={`rounded-lg border bg-white shadow-sm ${
                        tab === "mobile" ? "border-4 border-neutral-800" : "border-neutral-200"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Test send */}
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                <Input
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="כתובת למייל בדיקה"
                  className="max-w-xs"
                />
                <Button variant="outline" onPress={sendTest} isDisabled={sending || !testTo.trim()}>
                  {sending ? "שולח…" : "שלח בדיקה"}
                </Button>
                {sendResult?.ok && <span className="text-xs text-green-600">נשלח ✓</span>}
                {sendResult?.error && (
                  <span className="text-xs text-red-500">{sendResult.error}</span>
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}
