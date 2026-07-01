"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/auth";
import { getResend } from "@/lib/resend";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Resolves a tag by name within the org, creating it if needed.
async function ensureTag(orgId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return prisma.contactTag.upsert({
    where: { orgId_name: { orgId, name: trimmed } },
    update: {},
    create: { orgId, name: trimmed },
  });
}

// Imports contacts from an uploaded CSV. Recognized headers: email, firstName/first_name,
// lastName/last_name; any other columns are stored in `fields`. Optional tag applied to all.
export async function importContactsCsv(formData: FormData) {
  const { org } = await requireOrg();
  const file = formData.get("file");
  const tagName = String(formData.get("tag") ?? "");
  if (!(file instanceof File)) return { ok: false, error: "לא נבחר קובץ" };

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const tag = tagName ? await ensureTag(org.id, tagName) : null;
  let imported = 0;
  let skipped = 0;

  for (const row of parsed.data) {
    const lower: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) lower[k.trim().toLowerCase()] = v;

    const email = (lower["email"] ?? lower["e-mail"] ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      skipped += 1;
      continue;
    }
    const firstName = lower["firstname"] ?? lower["first_name"] ?? lower["first name"] ?? null;
    const lastName = lower["lastname"] ?? lower["last_name"] ?? lower["last name"] ?? null;

    const known = new Set(["email", "e-mail", "firstname", "first_name", "first name", "lastname", "last_name", "last name"]);
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(lower)) if (!known.has(k) && v) fields[k] = v;

    const contact = await prisma.contact.upsert({
      where: { orgId_email: { orgId: org.id, email } },
      update: { firstName, lastName, fields, source: "csv" },
      create: { orgId: org.id, email, firstName, lastName, fields, source: "csv" },
    });

    if (tag) {
      await prisma.contactTagMap.upsert({
        where: { contactId_tagId: { contactId: contact.id, tagId: tag.id } },
        update: {},
        create: { contactId: contact.id, tagId: tag.id },
      });
    }
    imported += 1;
  }

  revalidatePath("/contacts");
  return { ok: true, imported, skipped };
}

export async function addContact(formData: FormData) {
  const { org } = await requireOrg();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "אימייל לא תקין" };
  const firstName = String(formData.get("firstName") ?? "").trim() || null;

  await prisma.contact.upsert({
    where: { orgId_email: { orgId: org.id, email } },
    update: { firstName },
    create: { orgId: org.id, email, firstName, source: "manual" },
  });
  revalidatePath("/contacts");
  return { ok: true };
}

export async function deleteContact(id: string) {
  const { org } = await requireOrg();
  await prisma.contact.deleteMany({ where: { id, orgId: org.id } });
  revalidatePath("/contacts");
  return { ok: true };
}

// Pushes all subscribed contacts into a Resend Audience (creates one if needed).
export async function syncToResendAudience() {
  const { org } = await requireOrg();
  const resend = getResend(org);

  const audience = await resend.audiences.create({ name: `${org.name} — ${org.id}` });
  const audienceId = audience.data?.id;
  if (!audienceId) return { ok: false, error: "יצירת Audience נכשלה" };

  const contacts = await prisma.contact.findMany({
    where: { orgId: org.id, subscribed: true },
  });

  for (const c of contacts) {
    await resend.contacts.create({
      audienceId,
      email: c.email,
      firstName: c.firstName ?? undefined,
      lastName: c.lastName ?? undefined,
    });
  }

  return { ok: true, audienceId, count: contacts.length };
}
