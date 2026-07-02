import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const ACTIVE_ORG_COOKIE = "active_org";

// Resolves the Supabase-authenticated user and mirrors it into a local User row.
// Returns null when there is no signed-in user.
//
// Wrapped in React cache() so the (network) auth check + DB read run at most
// once per request — the dashboard layout and the page it renders both call
// this, and without deduping every navigation paid for it twice.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser?.email) return null;

  // Hot path: the mirror row already exists. A read is far cheaper than the
  // unconditional upsert (write) this used to do on every single page load;
  // only sync the email when it actually changed.
  const existing = await prisma.user.findUnique({
    where: { supabaseUserId: authUser.id },
    include: { memberships: { include: { org: true } } },
  });
  if (existing) {
    if (existing.email !== authUser.email) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { email: authUser.email },
        include: { memberships: { include: { org: true } } },
      });
    }
    return existing;
  }

  // First sight of this user — create the local mirror so app data can FK to a
  // stable User id.
  return prisma.user.create({
    data: {
      supabaseUserId: authUser.id,
      email: authUser.email,
      name: (authUser.user_metadata?.name as string | undefined) ?? null,
    },
    include: { memberships: { include: { org: true } } },
  });
});

// Use in Server Components / Actions that require an authenticated user.
export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

// Resolves the active organization for the signed-in user. The active org id is
// kept in a cookie (set when switching orgs); falls back to the first membership.
// New users with no org are sent to onboarding.
//
// Reuses the memberships already loaded by getCurrentUser instead of issuing a
// second query, and is itself cached so repeat calls within a request are free.
export const requireOrg = cache(async () => {
  const user = await requireUser();
  const memberships = user.memberships;

  if (memberships.length === 0) redirect("/onboarding");

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const active =
    memberships.find((m) => m.orgId === activeId) ?? memberships[0];

  return { user, org: active.org, role: active.role, memberships };
});

export { ACTIVE_ORG_COOKIE };
