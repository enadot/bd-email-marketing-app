import "server-only";
import { Resend } from "resend";
import { decryptSecret } from "./crypto";

// Returns a Resend client for an org, preferring its encrypted per-org key and
// falling back to the global RESEND_API_KEY.
export function getResend(org: { resendApiKey?: string | null }): Resend {
  let key = process.env.RESEND_API_KEY;
  if (org.resendApiKey) {
    try {
      key = decryptSecret(org.resendApiKey);
    } catch {
      // Fall back to the global key if decryption fails.
    }
  }
  if (!key) throw new Error("No Resend API key configured");
  return new Resend(key);
}

// Builds the From header for an org (uses its verified sending domain when set).
export function fromAddress(org: { name: string; sendingDomain?: string | null }): string {
  const domain = org.sendingDomain || "onboarding.resend.dev";
  const local = "no-reply";
  return `${org.name} <${local}@${domain}>`;
}
