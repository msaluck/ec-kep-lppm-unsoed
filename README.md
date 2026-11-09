# EC-KEP LPPM Unsoed

Research Ethics Review and Approval System for the **Komisi Etik Penelitian (KEP)**, LPPM Universitas Jenderal Soedirman. Digitizes the submission, review, and approval workflow for research ethics protocols across four roles, enforcing the working-day deadlines at each milestone.

## Contents

- [Overview](#overview)
- [Workflow](#workflow)
- [Panel-specific fields](#panel-specific-fields)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started (local development)](#getting-started-local-development)
- [Seeded accounts](#seeded-accounts)
- [Available scripts](#available-scripts)
- [Deployment (CloudPanel VPS)](#deployment-cloudpanel-vps)
- [Deployment (Vercel)](#deployment-vercel)
- [Deadline reminders (cron)](#deadline-reminders-cron)
- [Security notes](#security-notes)
- [Known limitations](#known-limitations)

## Overview

Four roles, each with their own dashboard:

| Role | Indonesian | Dashboard |
|---|---|---|
| Researcher | Pengusul / Peneliti | `/applications` |
| Secretariat | Sekretariat KEP | `/secretariat/queue` |
| Chairman | Ketua / Sekretaris KEP | `/chairman/queue` |
| Reviewer | Tim Penelaah / Rapat Pleno | `/reviewer/assignments` |
| Admin | - | `/admin/users` |

Researchers self-register at `/register`. Secretariat, Chairman, Reviewer, and Admin accounts are appointed positions provisioned by an Admin (`/admin/users/new`) or via the seed script — there is no self-signup for those roles.

## Workflow

The system enforces this sequential logic end to end:

1. **Milestone 1 - Submission.** Researcher picks a Panel (Sains dan Teknologi or Sosial dan Humaniora) and submits an application with a required Research Protocol document. Status: `SUBMITTED`. Each panel additionally requires the proposer's name, institution, and links (e.g. Google Drive - not file uploads) to several supporting forms, some shared between panels and some panel-specific; see [Panel-specific fields](#panel-specific-fields).
2. **Milestone 2 - Completeness check (2 working days).** Secretariat marks the application complete (-> forwarded to Chairman, Milestone 3 clock starts) or incomplete (-> returned to the researcher).
3. **Milestone 3 - Classification (3 working days).** Chairman classifies the application into one of three tracks:
   - **Exempted** -> exemption letter generated -> Chairman approval -> `APPROVED`.
   - **Expedited** -> reviewers assigned -> each votes Agree/Disagree.
   - **Full Board** -> plenary meeting scheduled with internal/external members -> minutes recorded.
4. **Milestone 4 - Review processing (max 10 working days).** Expedited voting or the Full Board meeting concludes, advancing the application to `PENDING_FINAL_DECISION`.
5. **Milestone 5 - Final decision (5 working days).** Chairman decides: **Approved** (Ethical Clearance PDF generated), **Revision Needed** (Saran perbaikan - capped at two rounds), or **Rejected**.
6. **Revision loop.** Revisi I: 10 working days to resubmit + 10 for re-review. Revisi II: 5 + 5. A third revision request is refused - the Chairman must Approve or Reject instead.

Every transition is recorded in `application_status_history` with its own deadline, and every notification attempt (sent or failed) is logged in `notification_logs`.

## Panel-specific fields

Selecting a panel at submission reveals additional required fields on top of the base form (title, research type, Research Protocol upload). Both panels share most of these fields; a few document links differ per panel:

| Field | Panel | Source |
|---|---|---|
| Nama Pengusul/Ketua Peneliti/Kegiatan Ilmiah | Both | Prefilled from the researcher's profile, editable |
| Judul Penelitian | Both | The application's main title field (not duplicated) |
| Alamat Email | Both | Read-only - the logged-in user's own email, not form input |
| No. HP (WhatsApp) | Both | Read-only - the logged-in user's own profile phone number, not form input |
| Universitas/Institusi | Both | Prefilled from the researcher's profile, editable per submission |
| Formulir Aplikasi Saintek (Word) | SAINTEK only | External link - required |
| Formulir Aplikasi Telaah Etik (Word) | SOSHUM only | External link - required |
| Proposal Penelitian (Pdf) | Both | External link - required |
| Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah (Pdf) | Both | External link - required |
| Formulir Pernyataan ...terkait Konflik Kepentingan (Pdf) | Both | External link - required |
| Lembar Informed Consent (Pdf) | SOSHUM only | External link - required |
| Instrumen Penelitian | SOSHUM only | External link - required |
| Dokumen Pendukung (Pdf) | Both | External link - optional |

All document fields here are plain URL inputs (e.g. a Google Drive link), not file uploads - a deliberate exception to the local-disk storage pattern used for the Research Protocol/Informed Consent/CV fields elsewhere in the form, since this paperwork is collected via shared drive links rather than direct upload. The read-only Email/No. HP fields are `disabled` inputs (excluded from form submission by the browser); the server action always re-derives them from the authenticated user's own database record rather than trusting anything the client could submit. Switching the Jenis Panel dropdown swaps the panel-specific fields in and out live, without a page reload.

## Tech stack

- **Next.js 14** (App Router), Server Actions for all mutations
- **Prisma ORM** targeting **MariaDB** (11.4 locally via Docker; 11.4.5 in production)
- **NextAuth.js** (Auth.js) v4, Credentials provider against the local `users` table, JWT sessions
- **Resend** + **React Email** for transactional email (best-effort - failures are logged, never block the workflow)
- **pdfkit** for server-side PDF generation (Ethical Clearance letter, Exemption letter)
- **Storage** - dual-mode (`lib/storage.ts`): local disk by default (local dev / CloudPanel VPS, where the filesystem is persistent); automatically switches to **Vercel Blob** when `BLOB_READ_WRITE_TOKEN` is set (Vercel's serverless functions have a read-only, ephemeral filesystem outside `/tmp`, so uploads and generated PDFs can't live on disk there)
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js`) - all styling lives in `app/globals.css`, with every semantic class (`.btn`, `.card`, `.field`, etc.) implemented via `@layer components` + `@apply` under a small set of CSS-variable design tokens. Auto light/dark mode via `prefers-color-scheme`, no toggle needed. Compiles to ~6KB gzipped.
- **Inter** via `next/font/google` - self-hosted at build time, no external font request, no layout shift
- **Playwright** (dev dependency) - used for manual end-to-end smoke-test scripts during development, not a committed test suite (see [Known limitations](#known-limitations))

## Project structure

```
app/
  actions/            Server Actions - one workflow step or account operation per file
  api/auth/           NextAuth route handler
  api/documents/[id]/ Authorized document download/streaming
  applications/       Researcher's application list, submission form, shared detail page
  secretariat/        Secretariat queue
  chairman/           Chairman queue
  reviewer/           Reviewer assignments
  admin/              Admin user management
  profile/            Profile + password change (all roles)
  login/, register/   Auth pages
components/
  applications/       Detail-page building blocks + per-status action forms
  admin/, auth/, profile/, layout/
  providers/          NextAuth SessionProvider wrapper
lib/                  Shared server-side logic (see below)
emails/               React Email templates
prisma/
  schema.prisma       Data model
  migrations/         Versioned SQL migrations
  seed.ts             Provisions Admin/Secretariat/Chairman/2 Reviewers
scripts/
  send-deadline-reminders.ts   CLI entry point (CloudPanel cron / manual run)
app/api/cron/reminders/        Vercel Cron entry point - same logic, different trigger
docker-compose.yml    Local MariaDB 11.4 container
vercel.json           Vercel Cron schedule (Vercel deployments only)
```

Key files under `lib/`:

| File | Purpose |
|---|---|
| `auth.ts` | NextAuth config (Credentials provider, JWT/session callbacks) |
| `prisma.ts` | Prisma client singleton |
| `working-days.ts` | Working-day deadline math (weekends only - no holiday calendar yet) |
| `current-deadline.ts` | Maps an application's status to its currently-active deadline field |
| `notify.ts` | Send-then-log helper wrapping every Resend call |
| `finalize-approval.ts` | Shared write-PDF-then-transaction-then-notify sequence used by both approval paths |
| `documents.ts` | Shared file-upload helper (delegates to `storage.ts`) |
| `storage.ts` | Dual-mode file storage - local disk or Vercel Blob, see [Tech stack](#tech-stack) |
| `require-session.ts` | Server-component role guard |
| `revision-policy.ts` | Revision I/II day counts, shared between the decision and resubmission actions |
| `deadline-reminders.ts` | Deadline-reminder scan/send logic, shared by the CLI script and the Vercel Cron route |

## Getting started (local development)

### Prerequisites

- Node.js 20+
- Docker + Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
- Set real values for `MARIADB_PASSWORD` / `MARIADB_ROOT_PASSWORD` (or leave the placeholders for local-only use).
- Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`.
- Add a Resend API key if you want to test email delivery (optional - the app works fine without one; sends will just fail and get logged).

### 3. Start the database

```bash
docker compose up -d
```

This starts a dedicated `mariadb:11.4` container on `127.0.0.1:3308` (not 3306, in case another local project already uses that port).

The database user created by `docker-compose.yml` only has privileges on its own database. `prisma migrate dev` needs a shadow database and will fail with `P3014` unless the user can create databases. For local dev, grant that once:

```bash
docker exec ec-kep-lppm-unsoed-db mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" \
  -e "GRANT ALL PRIVILEGES ON *.* TO '${MARIADB_USER}'@'%'; FLUSH PRIVILEGES;"
```

### 4. Run migrations and seed

```bash
npx prisma migrate deploy   # applies the committed migrations in prisma/migrations/
npm run prisma:seed         # creates Admin/Secretariat/Chairman/2 Reviewer accounts
```

(`prisma migrate dev` also works locally if you want to author a *new* migration interactively; `migrate deploy` just applies what's already committed and is what CI/production will use.)

### 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` - it redirects to `/login` when signed out.

## Seeded accounts

`npm run prisma:seed` creates one account per staff role, all sharing the same password unless overridden:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@lppm.unsoed.ac.id` | `ChangeMe123!` (or `$SEED_DEFAULT_PASSWORD`) |
| Secretariat | `sekretariat@lppm.unsoed.ac.id` | same |
| Chairman | `ketua@lppm.unsoed.ac.id` | same |
| Reviewer | `penelaah1@lppm.unsoed.ac.id` | same |
| Reviewer | `penelaah2@lppm.unsoed.ac.id` | same |

The seed is idempotent (`upsert` with an empty `update`) - re-running it won't reset a password that's already been changed. Researcher accounts are created via `/register`, not seeded.

Change these passwords via `/profile` (self-service) or `/admin/users/[id]` (Admin reset) before any real use.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (`output: standalone`) |
| `npm run start` | Run the standalone build (`node .next/standalone/server.js`) |
| `npm run typecheck` | `tsc --noEmit` across the whole project |
| `npm run lint` | `next lint` |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | `prisma migrate deploy` - apply committed migrations (production-safe) |
| `npm run prisma:seed` | Run `prisma/seed.ts` |
| `npm run reminders` | Run the deadline-reminder job once (see below) |

## Deployment (CloudPanel VPS)

Target environment: Ubuntu 24.04, CloudPanel's Node.js site type, **local** MariaDB 11.4.5 (no Docker in production - `docker-compose.yml` is for local dev only).

1. Provision a MariaDB database and user matching `DATABASE_URL="mysql://user:pass@127.0.0.1:3306/db_name"`.
2. Set real values for every variable in `.env.example`'s production section, especially `UPLOAD_DIR` pointing *outside* the public web root (e.g. `/home/cloudpanel/htdocs/<site>/storage/uploads`).
3. `npm install && npm run build`.
4. `output: 'standalone'` means `.next/standalone` does **not** include `public/` or `.next/static` - copy them in before starting:
   ```bash
   cp -r public .next/standalone/
   cp -r .next/static .next/standalone/.next/
   ```
5. `npm run prisma:migrate` against the production database.
6. `npm run prisma:seed` once, then change every seeded password immediately.
7. Start via CloudPanel's Node.js process manager pointing at `.next/standalone/server.js`.

## Deployment (Vercel)

Vercel's serverless functions have a **read-only, ephemeral filesystem** (only `/tmp`, wiped between invocations) and can't reach a database on `127.0.0.1` — the opposite of the CloudPanel VPS this app was originally built for. Three things are handled differently as a result, all already wired up in the codebase:

- **File storage** - `lib/storage.ts` automatically uses **Vercel Blob** instead of local disk whenever `BLOB_READ_WRITE_TOKEN` is set (Step 3 below sets it for you).
- **Database** - needs a MySQL-compatible database reachable over the internet, not a local one.
- **Deadline reminders** - runs as a **Vercel Cron** job hitting `/api/cron/reminders` (see `vercel.json`) instead of a crontab entry.

### 1. Provision a database

Any internet-reachable MySQL-compatible database works (e.g. **PlanetScale**, **Railway**, or **Aiven**). Steps for any of them are the same shape:

1. Create a MySQL/MariaDB database instance.
2. Copy its connection string into the form `mysql://user:password@host:port/database`.
3. If the provider requires TLS (most do), append the query params it documents, e.g. PlanetScale: `?sslaccept=strict`.

Since a single Vercel deployment can spin up many concurrent serverless function instances, each opening its own Prisma connection, prefer a provider with built-in connection pooling (PlanetScale's proxy does this automatically). If yours doesn't, cap Prisma's own pool via the connection string, e.g. `?connection_limit=5`.

### 2. Push the schema to that database

From your machine, with `DATABASE_URL` in `.env` temporarily pointed at the new production database:

```bash
npx prisma migrate deploy   # applies prisma/migrations/ to the production DB
npm run prisma:seed         # creates the initial Admin/Secretariat/Chairman/Reviewer accounts
```

Change every seeded password immediately after (via `/admin/users/[id]` once the app is live, or directly).

### 3. Create a Vercel Blob store

In the Vercel dashboard: **Storage** tab -> **Create Database** -> **Blob** -> connect it to this project. This automatically adds `BLOB_READ_WRITE_TOKEN` to the project's environment variables, which is all `lib/storage.ts` needs to switch from local disk to Blob.

### 4. Import and configure the project

1. Push this repository to GitHub/GitLab/Bitbucket, then **Import Project** in Vercel and select it (Next.js is auto-detected, no build command changes needed).
2. Under **Settings -> Environment Variables**, add (Production, and Preview if you want preview deployments to also work):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | The production connection string from Step 1 |
   | `NEXTAUTH_URL` | Your Vercel deployment URL, e.g. `https://ec-kep-lppm-unsoed.vercel.app` |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `RESEND_API_KEY` | Your Resend API key |
   | `RESEND_FROM_EMAIL` | `onboarding@resend.dev` until a sending domain is verified |
   | `CRON_SECRET` | `openssl rand -base64 32` - Vercel sends this back as `Authorization: Bearer <value>` when it calls the cron route |

   (`BLOB_READ_WRITE_TOKEN` was already added in Step 3 - don't set `UPLOAD_DIR`, it's ignored once Blob is active.)
3. Deploy. Vercel picks up `vercel.json` automatically and schedules `/api/cron/reminders` once a day (`0 0 * * *` UTC = 07:00 WIB, matching the original CloudPanel cron time) - no extra setup needed. Note: the Hobby plan only allows daily-or-less-frequent cron schedules.

### 5. Verify

- Visit the deployment URL, log in with a seeded account, submit a test application with a real file upload, and confirm it downloads correctly afterward (this exercises the Blob path end to end).
- `GET https://<your-app>.vercel.app/api/cron/reminders` should return `401 Unauthorized` without the right header - that's correct, it means an outsider can't trigger it. Vercel's own scheduled invocation includes the header automatically.

### Notes for a client trial

- This gets your client a working URL quickly, but it's still pointed at real production-shaped infrastructure (a real database, real file storage) - there's no "toy" mode. Treat any data entered during the trial as real data unless you reset the database afterward.
- Everything above coexists with the CloudPanel deployment path - `lib/storage.ts` and `next.config.js` both branch on environment (`BLOB_READ_WRITE_TOKEN` / `VERCEL`), so this repo can still be deployed to CloudPanel unchanged later.

## Deadline reminders (cron)

The core logic lives in `lib/deadline-reminders.ts`: it scans for applications with a deadline that's overdue, due today, or due tomorrow, and emails the right people for that status (Secretariat, Chairman, pending Reviewers, or the Researcher). It dedupes against `notification_logs` so running it more than once a day is harmless. Two entry points call it, depending on where the app is deployed:

- **CloudPanel VPS** - `scripts/send-deadline-reminders.ts` (`npm run reminders`), invoked via crontab:

  ```
  0 7 * * * cd /home/cloudpanel/htdocs/<site> && npm run reminders >> storage/logs/reminders.log 2>&1
  ```

- **Vercel** - `app/api/cron/reminders/route.ts`, invoked by Vercel Cron per the schedule in `vercel.json` (`CRON_SECRET` gates it against anyone else calling the URL). See [Deployment (Vercel)](#deployment-vercel).

## Security notes

- Every Server Action re-checks the caller's role server-side via `getServerSession` - the UI hiding a button is not the security boundary.
- Document downloads (`/api/documents/[id]`) re-run the same authorization check as the application detail page before streaming a file - IDs are unguessable cuids, not access tokens, but the check doesn't rely on that alone.
- Passwords are hashed with bcrypt (10 salt rounds). Admin-created accounts and Admin-triggered resets get a randomly generated one-time password, shown once and never stored in retrievable form.
- Uploaded files and generated PDFs are stored on the local filesystem, never executed, and served only through the authenticated download route - not directly from `public/`.

## Known limitations

See [PROGRESS.md](PROGRESS.md) for the full, continuously updated list. In short, as of this writing:

- No verified Resend sending domain yet - real email delivery only reaches the Resend account owner's own address until one is verified.
- No automated test suite (unit/integration/e2e) - verification so far has been manual Playwright smoke-test scripts, run and discarded.
- Not yet deployed to a real CloudPanel/production environment.
