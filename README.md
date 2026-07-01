# Edri Mail Marketing

פלטפורמת **סדרות מיילים שיווקיות (email sequences)** רב-לקוחתית, מבוססת AI.
כל ארגון יכול ליצור סדרות מיילים בשתי דרכים: עם **Claude** (בריף → סדרה מלאה) או **ידנית** דרך עורך בלוקים (drag & drop).

## Stack

- **Next.js 16** (App Router, Turbopack) · React 19 · TypeScript
- **HeroUI v3** + Tailwind CSS v4 (RTL מלא, ממשק בעברית)
- **Supabase** — Postgres + Auth (email/password + magic link)
- **Prisma 7** (pg driver adapter)
- **Resend** + **React Email** — עיצוב ושליחת מיילים
- **Anthropic SDK** (`claude-opus-4-8`) — יצירת סדרות עם structured output

## הגדרה ראשונית

1. העתק `.env.example` ל-`.env` ומלא את הערכים:
   - **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (pooler), `DIRECT_URL` (direct)
   - **Resend**: `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`
   - **Anthropic**: `ANTHROPIC_API_KEY`
   - **App**: `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `ENCRYPTION_KEY` (32 בייט base64)

   ליצירת `ENCRYPTION_KEY`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. התקנה + סכמה:
   ```bash
   npm install
   npm run db:generate      # Prisma client
   npm run db:migrate       # יצירת הטבלאות ב-Supabase
   ```
   ואז הרץ את `prisma/rls.sql` ב-Supabase SQL editor (אבטחת RLS).

3. ב-Supabase Auth → URL Configuration, הוסף את `NEXT_PUBLIC_APP_URL` ו-`<app>/auth/callback` ל-Redirect URLs (לטובת magic link / אימות מייל).

4. הרצה:
   ```bash
   npm run dev              # http://localhost:3000
   npm run email:dev        # תצוגת תבניות React Email (פורט 3001)
   ```

## תזמון (scheduler)

- `GET /api/cron/tick` מעבד enrollments שהגיע זמנם (שולח את המייל הבא, מעריך תנאי דילוג, מקדם לצעד הבא).
- ב-Vercel: מוגדר ב-`vercel.json` לרוץ כל 15 דקות. הקריאה מאומתת ע"י `CRON_SECRET`.
- הרצה ידנית מקומית: `curl "http://localhost:3000/api/cron/tick?secret=$CRON_SECRET"`

## Webhooks

- **Resend events** → `POST /api/webhooks/resend` (פתיחות/קליקים/באונסים → `SendLog`). הגדר ב-Resend dashboard עם `RESEND_WEBHOOK_SECRET`.
- **אנשי קשר חיצוניים** → `POST /api/webhooks/contacts?integration=<id>` עם `X-Webhook-Secret`. צור אינטגרציה במסך ההגדרות.
- **הסרה מרשימה** → `GET/POST /api/unsubscribe` (גם ב-List-Unsubscribe header).

## מבנה

```
app/(auth)        התחברות / הרשמה
app/(dashboard)   סקירה · סדרות · תבניות · אנשי קשר · אנליטיקס · הגדרות
app/api           cron/tick · webhooks/{resend,contacts} · unsubscribe
emails/           תבניות React Email
lib/              prisma · supabase · auth · blocks · ai · scheduler · resend · actions
components/       editor (block) · sequence · contacts · settings · dashboard
```
