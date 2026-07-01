// Hebrew labels for DB enum values shown in the UI.

export const SEQUENCE_STATUS_LABEL: Record<string, string> = {
  draft: "טיוטה",
  active: "פעילה",
  paused: "מושהית",
  archived: "בארכיון",
};

export const CONTACT_SOURCE_LABEL: Record<string, string> = {
  manual: "ידני",
  csv: "CSV",
  resend_audience: "Resend",
  webhook: "Webhook",
  api: "API",
};

export const SEND_STATUS_LABEL: Record<string, string> = {
  queued: "בתור",
  sent: "נשלח",
  delivered: "נמסר",
  opened: "נפתח",
  clicked: "נלחץ",
  bounced: "הוחזר",
  complained: "תלונה",
  failed: "נכשל",
};

export const DELAY_UNIT_LABEL: Record<string, string> = {
  minutes: "דקות",
  hours: "שעות",
  days: "ימים",
};
