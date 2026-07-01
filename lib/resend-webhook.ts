import "server-only";
import crypto from "node:crypto";

// Verifies a Resend (Svix) webhook signature.
// Resend signs with: base64(HMAC_SHA256(secret, `${id}.${timestamp}.${payload}`))
// where the secret is the base64 part after the "whsec_" prefix.
export function verifyResendSignature(
  payload: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string | undefined,
): boolean {
  // No secret configured → accept (useful for local dev).
  if (!secret) return true;
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", key)
    .update(signedContent)
    .digest("base64");

  // Header may contain multiple space-separated `v1,<sig>` entries.
  return signature.split(" ").some((part) => {
    const sig = part.includes(",") ? part.split(",")[1] : part;
    try {
      return (
        sig.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
      );
    } catch {
      return false;
    }
  });
}
