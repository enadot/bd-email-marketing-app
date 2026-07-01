import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const ACTIVE_ORG_COOKIE = "active_org";

// Resolves the Supabase-authenticated user and mirrors it into a local User row.
// Returns null when there is no signed-in user.
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser?.email) return null;

  // Upsert the local mirror so app data can FK to a stable User id.
  const user = await prisma.user.upsert({
    where: { supabaseUserId: authUser.id },
    update: { email: authUser.email },
    create: {
      supabaseUserId: authUser.id,
      email: authUser.email,
      name: (authUser.user_metadata?.name as string | undefined) ?? null,
    },
    include: { memberships: { include: { org: true } } },
  });

  return user;
}

// Use in Server Components / Actions that require an authenticated user.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Resolves the active organization for the signed-in user. The active org id is
// kept in a cookie (set when switching orgs); falls back to the first membership.
// New users with no org are sent to onboarding.
export async function requireOrg() {
  const user = await requireUser();
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { org: true },
  });

  if (memberships.length === 0) redirect("/onboarding");

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const active =
    memberships.find((m) => m.orgId === activeId) ?? memberships[0];

  return { user, org: active.org, role: active.role, memberships };
}

export { ACTIVE_ORG_COOKIE };
