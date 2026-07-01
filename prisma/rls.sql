-- Row Level Security for the email-sequence platform.
--
-- The app talks to Postgres through Prisma using a privileged connection
-- (DATABASE_URL), which BYPASSES RLS — so enabling RLS does not break the app.
-- Its purpose here is defense-in-depth: it denies access via Supabase's anon /
-- authenticated roles (PostgREST), since tenant data should only be reached
-- through the app's org-scoped queries.
--
-- With RLS enabled and NO permissive policies, anon/authenticated get zero rows.
-- Run this once in the Supabase SQL editor after `prisma migrate`.

ALTER TABLE "Organization"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sequence"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SequenceStep"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactTag"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactTagMap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enrollment"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SendLog"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brief"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration"   ENABLE ROW LEVEL SECURITY;

-- No policies are created on purpose: only the privileged Prisma connection
-- (which bypasses RLS) may read/write. If you later expose any table through
-- PostgREST, add explicit policies keyed on the org membership of auth.uid().
