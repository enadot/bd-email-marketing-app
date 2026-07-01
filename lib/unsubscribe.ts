import "server-only";
import crypto from "node:crypto";

// Signs/verifies unsubscribe tokens so the link can't be forged.
function secret() {
  return process.env.ENCRYPTION_KEY ?? process.env.CRON_SECRET ?? "dev-secret";
}

export function makeUnsubToken(contactId: string): string {
  return crypto.createHmac("sha256", secret()).update(contactId).digest("hex").slice(0, 32);
}

export function verifyUnsubToken(contactId: string, token: string): boolean {
  const expected = makeUnsubToken(contactId);
  // Constant-time compare.
  return (
    token.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  );
}

export function unsubscribeUrl(contactId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/unsubscribe?c=${contactId}&t=${makeUnsubToken(contactId)}`;
}
