import { Chip } from "@heroui/react";
import { SEQUENCE_STATUS_LABEL, SEND_STATUS_LABEL } from "@/lib/labels";

type ChipColor = "default" | "success" | "warning" | "danger";

const SEQ_COLOR: Record<string, ChipColor> = {
  draft: "default",
  active: "success",
  paused: "warning",
  archived: "default",
};

const SEND_COLOR: Record<string, ChipColor> = {
  queued: "default",
  sent: "default",
  delivered: "success",
  opened: "success",
  clicked: "success",
  bounced: "danger",
  complained: "danger",
  failed: "danger",
};

export function SequenceStatusChip({ status, size }: { status: string; size?: "sm" | "md" }) {
  return (
    <Chip color={SEQ_COLOR[status] ?? "default"} size={size ?? "sm"}>
      {SEQUENCE_STATUS_LABEL[status] ?? status}
    </Chip>
  );
}

export function SendStatusChip({ status, size }: { status: string; size?: "sm" | "md" }) {
  return (
    <Chip color={SEND_COLOR[status] ?? "default"} size={size ?? "sm"}>
      {SEND_STATUS_LABEL[status] ?? status}
    </Chip>
  );
}
