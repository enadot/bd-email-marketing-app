"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { deleteIntegration } from "@/lib/actions/settings";

export function IntegrationRow({
  id,
  name,
  secret,
  webhookUrl,
}: {
  id: string;
  name: string;
  secret: string;
  webhookUrl: string;
}) {
  const router = useRouter();
  const [busy, startBusy] = useTransition();

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <p className="font-medium">{name}</p>
        <Button
          variant="danger-soft"
          onPress={() =>
            startBusy(async () => {
              await deleteIntegration(id);
              router.refresh();
            })
          }
          isDisabled={busy}
        >
          מחק
        </Button>
      </div>
      <div className="mt-2 flex flex-col gap-2 text-xs">
        <Row label="Webhook URL" value={webhookUrl} onCopy={() => copy(webhookUrl)} />
        <Row label="Secret" value={secret} onCopy={() => copy(secret)} mono />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-neutral-500">{label}</span>
      <code
        className={`flex-1 truncate rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </code>
      <button onClick={onCopy} className="text-blue-600 hover:underline">
        העתק
      </button>
    </div>
  );
}
