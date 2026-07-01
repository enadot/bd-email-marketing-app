"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, ACTIVE_ORG_COOKIE } from "@/lib/auth";

// Creates an organization and makes the current user its owner, then switches to it.
export async function createOrg(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const org = await prisma.organization.create({
    data: {
      name,
      memberships: { create: { userId: user.id, role: "owner" } },
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, org.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}

// Switches the active organization (must be a member).
export async function switchOrg(orgId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, orgId },
  });
  if (!membership) return;

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/");
}
