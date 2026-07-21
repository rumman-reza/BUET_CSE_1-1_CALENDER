# BUET CSE 1-1 Academic Calendar

A shared, calendar-first academic calendar for BUET CSE Level-1 Term-1: class tests, quizzes,
assignments, labs, presentations, viva, project deadlines, and exams — one source of truth.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · FullCalendar · Supabase
(Auth + Postgres + RLS) · TanStack Query · React Hook Form + Zod · Framer Motion · Lucide

---

## 1. What's actually implemented

Built and working:
- Google + email/password auth via Supabase, with an auto-created `profiles` row per user
- Two roles — `student` and `admin` (CR/Admin) — enforced by **Postgres Row Level Security**,
  not just the UI. Only admins can write to `events`, `courses`, `announcements`
- Calendar-first homepage: month / week / day / agenda views, click a day to add an event
  (admin), click an event for a detail drawer, drag-and-drop + resize to reschedule (admin)
- Search (course, title, teacher, room) + filters (course, event type) that update the
  calendar and sidebar instantly
- Admin panel: full CRUD for events, courses, and announcements
- Dashboard stats strip (today, this week, upcoming CTs/assignments, countdown to next event)
- Per-event and full-calendar **.ics export** (works with Google/Apple/Outlook subscription)
- Dark / light / system theme
- Responsive layout, installable **PWA manifest**, and a basic offline-shell service worker

Simplified / left as a follow-up (flagging honestly rather than pretending these are done):
- **Push notifications** are not wired up — Web Push requires a backend worker + VAPID keys
  and is a good v2 addition; the reminder *times* are stored per-event (`reminder_minutes`)
  so the data model is ready for it
- CSV bulk import and per-event edit-history UI have their tables (`event_history`) but no
  screen yet — the audit trigger point is there, just not surfaced
- The service worker caches the app shell for offline *viewing* of the last-loaded page; it
  doesn't do full background sync

---

## 2. Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys (step 3 below)
npm run dev
```

Open http://localhost:3000.

---

## 3. Set up Supabase

### 3.1 Create the project
1. Go to https://supabase.com/dashboard → **New project**.
2. Pick a name (e.g. `cse11-calendar`), a database password (save it), and a region close to
   Bangladesh (e.g. Singapore).
3. Wait ~2 minutes for provisioning.

### 3.2 Run the database migration
1. In your Supabase project, open **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql` from this repo.
3. Click **Run**. This creates the `profiles`, `courses`, `events`, `event_history`, and
   `announcements` tables, sets up Row Level Security policies, a trigger that auto-creates a
   profile on signup, and seeds the 8 default courses.

### 3.3 Get your API keys
Project **Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Put both into `.env.local` (copy `.env.example`).

### 3.4 Turn on Google login (optional but recommended)
1. Supabase → **Authentication → Providers → Google** → toggle on.
2. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an
   OAuth 2.0 Client ID (Web application).
3. Add this **Authorized redirect URI** (Supabase shows the exact value on the same screen):
   `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
4. Copy the Client ID + Secret into the Supabase Google provider form → Save.
5. In **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000` (add your Vercel URL here too after deploying)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and later
     `https://your-app.vercel.app/auth/callback`

### 3.5 Make yourself an admin (CR/Admin)
Every new signup starts as `student`. Promote yourself after your first login:
1. Sign up / log in once on the running app.
2. Supabase → **SQL Editor**:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Refresh the app — you'll now see the **Admin** link in the navbar and can add/edit events.
4. From then on, you (as an existing admin) can promote other students the same way, or build
   a small "promote to admin" button in `/admin` later — the RLS policy already allows any
   admin to update the `role` column.

---

## 4. Deploy — Vercel + Supabase

You already did the Supabase half above. Now ship the frontend:

1. **Push this project to GitHub** (a private repo is fine):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/cse11-calendar.git
   git push -u origin main
   ```

2. **Import into Vercel**
   - Go to https://vercel.com/new
   - Import the GitHub repo you just pushed
   - Framework preset: Vercel auto-detects **Next.js** — leave build command / output as
     default (`next build`)

3. **Add environment variables** (Vercel project → **Settings → Environment Variables**),
   same two keys as your `.env.local`, applied to Production, Preview, and Development:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy.** Vercel builds and gives you a URL like `https://cse11-calendar.vercel.app`.

5. **Point Supabase auth back at your live URL**
   - Supabase → **Authentication → URL Configuration**:
     - Site URL → `https://cse11-calendar.vercel.app`
     - Redirect URLs → add `https://cse11-calendar.vercel.app/auth/callback`
   - If you enabled Google login, add the same production URL as an **Authorized redirect
     URI** in the Google Cloud OAuth client (it can hold multiple URIs — keep the localhost
     one too for local dev).

6. **Custom domain (optional):** Vercel → **Settings → Domains** → add your domain, point its
   DNS per Vercel's instructions, then repeat step 5 with the custom domain.

That's it — every push to `main` auto-redeploys on Vercel; every schema change goes through a
new file in `supabase/migrations/` run in the SQL Editor (Supabase doesn't auto-run these;
treat them as a changelog you paste in manually, or wire up the Supabase CLI later for real
migration tracking).

---

## 5. Project structure

```
app/
  page.tsx                 → calendar-first homepage
  login/page.tsx            → Google + email auth
  admin/page.tsx             → admin-only CRUD panel
  about/page.tsx
  auth/callback/route.ts     → OAuth code exchange
  api/ics/route.ts           → .ics export (single event or full feed)
components/                  → calendar, sidebar, drawers, forms, navbar
lib/
  supabase/client.ts | server.ts
  queries.ts                 → TanStack Query hooks (courses/events/announcements)
  use-profile.ts             → current user + role
  types.ts                   → shared types + event-type icon/color map
middleware.ts                 → refreshes the Supabase session on every request
supabase/migrations/0001_init.sql → full schema + RLS policies + seed courses
```

## 6. Notes on the two roles

The brief mentioned three roles (Student / Admin / Super Admin) in one version and two
(Student / CR-Admin) in the revision — this build uses **two roles** (`student`, `admin`)
since that's what the more detailed, final spec asked for. Adding a `super_admin` later is a
one-line enum change (`alter type user_role add value 'super_admin'`) plus a couple of RLS
policy tweaks if you want that tier back.
