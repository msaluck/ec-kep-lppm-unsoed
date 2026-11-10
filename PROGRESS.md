# Progress - EC-KEP LPPM Unsoed

Last updated: 2026-07-24

## Done

**Infra/config**
- `prisma/schema.prisma` - full MariaDB schema (8 models, 8 enums), validated with `prisma validate`
- `next.config.js` - standalone output, `serverActions.bodySizeLimit`, `pdfkit` excluded from bundling, `outputFileTracingRoot` for CloudPanel
- `package.json`, `.env.example`, `.gitignore`, `tsconfig.json`
- `docker-compose.yml` - dedicated `mariadb:11.4` container for local dev (host port 3308, since 3306/3307 are taken by other local containers). Credentials generated into `.env` (gitignored). Bring up with `docker compose up -d`.

**Backend / Server Actions** (all typecheck + build clean)
- Milestone 1 - `app/actions/submit-application.ts` (submission + file upload)
- Milestone 2 - `app/actions/review-completeness.ts` (Secretariat complete/incomplete)
- Milestone 3 - `app/actions/classify-application.ts` (Exempted / Expedited / Full Board)
- Exempted track - `app/actions/approve-exemption.ts`
- Expedited track - `app/actions/submit-review-vote.ts` (auto-advances once all votes in)
- Full Board track - `app/actions/schedule-plenary-meeting.ts`, `app/actions/complete-plenary-meeting.ts`
- Milestone 5 - `app/actions/approve-application.ts` (Approved), `app/actions/decide-final-outcome.ts` (Revision/Reject, capped at 2 rounds)
- Revision loop - `app/actions/resubmit-revision.ts`
- Auth - `app/actions/register-researcher.ts`

**Shared lib/**
`prisma.ts`, `auth.ts`, `resend.ts`, `storage.ts`, `working-days.ts`, `application-number.ts`, `notify.ts`, `finalize-approval.ts`, `revision-policy.ts`, `documents.ts`, `require-session.ts`, `status-labels.ts`, `current-deadline.ts`, `pdf/ethical-clearance.ts`, `pdf/exemption-letter.ts`

**UI**
- Full auth flow: `app/login/page.tsx`, `app/register/page.tsx`, root layout + session provider
- Role-aware nav header (`components/layout/app-header.tsx`, `page-shell.tsx`)
- Researcher: `/applications`, `/applications/new`
- Secretariat: `/secretariat/queue`
- Chairman: `/chairman/queue`
- Reviewer: `/reviewer/assignments`
- Admin: `/admin/users` (list + role filter), `/admin/users/new` (create account, shows the generated temp password once), `/admin/users/[id]` (deactivate/reactivate, reset password)
- `/profile` (all roles) - update name/institution/phone, self-service password change (`app/actions/update-profile.ts`, `app/actions/change-password.ts`)
- Shared detail page `/applications/[id]` - renders the correct action form per (role, status); Researcher gets document delete/add-more while status is `SUBMITTED` (`app/actions/delete-document.ts` guards against deleting the only Research Protocol on file; `app/actions/add-document.ts`)
- Secured document download at `/api/documents/[id]`
- `components/layout/pagination.tsx` - shared pagination (20/page), applied to all four list/queue pages plus the Admin user list; Chairman queue sorts by a computed cross-column deadline in memory, so it paginates by slicing the sorted array rather than DB-level `skip`/`take` (which would paginate before the sort)

**Ops scripts**
- `prisma/seed.ts` - seeds Admin/Secretariat/Chairman/2 Reviewers
- `scripts/send-deadline-reminders.ts` - cron-ready, dedupes same-day reminders

**Verified**
- `npm install`, `npx prisma generate`/`validate`, `npm run typecheck`, `next build` all pass clean
- Live MariaDB container is up and migrated for real: `npx prisma migrate dev --name init` applied successfully, all 8 tables confirmed present (`_prisma_migrations`, `applications`, `application_status_history`, `documents`, `meeting_participants`, `notification_logs`, `plenary_meetings`, `review_assignments`, `users`) - `prisma/migrations/20260715215622_init/` now exists in the repo
- `npm run prisma:seed` ran for real against the live DB - 4 users created (Secretariat, Chairman, 2 Reviewers), confirmed via direct SQL query; re-ran it a second time and confirmed it's idempotent (still exactly 4 rows, no duplicates, `update: {}` left existing rows untouched)
- `npm run reminders` ran for real against the live DB - exits cleanly with "0 sent" (correct, since no applications exist yet)
- **Full end-to-end smoke test, driven in a real headless Chromium (Playwright) against `next dev` + the live DB**: register researcher -> login -> submit application (real file upload) -> Secretariat marks complete -> Chairman classifies Expedited -> both seeded Reviewers vote Sepakat (auto-advances to `PENDING_FINAL_DECISION`) -> Chairman approves -> status `APPROVED`. Verified in the DB afterward: correct `applications`/`application_status_history` rows at every step, a real 1-page PDF (`ethical-clearance-*.pdf`) written to `public/uploads/applications/<number>/`, and every `NotificationLog` row correctly marked `FAILED` with `errorMessage: "API key is invalid"` (dummy Resend key) - confirming email failures never block the workflow, only get logged. No console/page errors other than a handful of benign `next-auth CLIENT_FETCH_ERROR` (aborted background session-poll fetches from the test script's rapid programmatic navigation - did not affect correctness of any step). Test data cleaned up afterward; DB is back to seeded-only state. `playwright` added as a devDependency for this.
- **Real Resend API key confirmed working**: sent an actual test email via `resend.emails.send` using the user's real key - delivered successfully (message id `ca1202a5-3eb8-4d59-89e7-d5487c8304c5`). Note: the Resend account (owner address `syaiful.id@gmail.com`) has no verified sending domain yet, so until one is verified, Resend will only actually deliver to that one address - sends to any other recipient (including all seeded/test accounts) return a 403 validation error, correctly logged as `FAILED` in `NotificationLog` rather than crashing anything.
- **Removed the 4 unused `ApplicationStatus` values** (`DRAFT`, `SECRETARIAT_REVIEW`, `CHAIRMAN_CLASSIFYING`, `CLOSED`) - none had a real trigger in the described workflow. Updated `prisma/schema.prisma` and `lib/status-labels.ts` (grepped the whole codebase first to confirm nothing else referenced them), regenerated the Prisma client, confirmed `npm run typecheck` and `next build` stay clean. Applied for real against the live DB via a hand-built migration (`prisma migrate dev` needed a TTY for the enum-narrowing warning, so used `prisma migrate diff --script` + `prisma migrate deploy` instead - the same non-interactive path production deploys will use) - `prisma/migrations/20260716014042_remove_unused_application_statuses/`. Confirmed via `SHOW COLUMNS` that the live `applications.status` enum now only has the 14 real values, and `prisma migrate status` reports the schema up to date.
- **Missing-features bucket implemented**: profile/password-change page for every role; Admin role given an actual purpose (create Secretariat/Chairman/Reviewer/Admin/Researcher accounts with a one-time temp password, deactivate/reactivate, reset password - the only prior way to provision staff accounts was editing `prisma/seed.ts`); pagination (20/page) on all four list/queue pages plus the Admin user list; Researcher document delete/add-more while `SUBMITTED`. No schema changes needed - `User` already had every field required. Full `next build` stays clean (16 routes).
- **Live end-to-end verification of all of the above**, via two more Playwright smoke-test scripts (dev server against the live DB, deleted after use): (1) Admin creates a Secretariat account -> logs in with the one-time temp password -> updates profile -> changes password -> confirms the *old* temp password is correctly rejected and the *new* one works -> Admin deactivates the account -> confirms the deactivated account is correctly rejected on login. (2) Researcher submits an application -> adds a supporting document -> deletes it (row count verified to drop by exactly 1) -> confirms the "cannot delete the only Research Protocol" guard actually fires with the correct message when tried on the last remaining protocol document. Test data cleaned up afterward; DB back to exactly 5 seeded users (now including Admin), 0 applications.
- **Panel Type added to submission** (`/applications/new`): required "Jenis Panel" select - Panel Sains dan Teknologi (SAINTEK) or Panel Sosial dan Humaniora (SOSHUM). Both panels share: Nama Pengusul/Ketua Peneliti/Kegiatan Ilmiah (prefilled from profile, editable), read-only Email/No. HP pulled from the logged-in user's own DB record (not client-submitted - can't be spoofed), Universitas/Institusi (prefilled from profile, editable, stored per-submission on `Application.institution` since it can differ from the profile's), Proposal Penelitian / Formulir Pernyataan Ketua Peneliti / Formulir Pernyataan Konflik Kepentingan (required links) and Dokumen Pendukung (optional link). Each panel also has its own document(s), swapped by the dropdown: SAINTEK needs its own application form link (Formulir Aplikasi Saintek); SOSHUM needs its own application form link (Formulir Aplikasi Telaah Etik) plus two SOSHUM-only links (Lembar Informed Consent, Instrumen Penelitian). All document fields are external links (e.g. Google Drive), not file uploads - a deliberate departure from the local-file-upload pattern used for the base Research Protocol/Informed Consent/CV fields, per explicit request. New `PanelType` enum + 10 nullable `Application` columns total (7 added initially for SAINTEK, 3 more added for SOSHUM-only fields), migrated live in two additive migrations (`add_panel_type_and_saintek_fields`, `add_soshum_fields`) - neither needed the interactive-warning workaround since purely additive. `submit-application.ts`'s validation is now a single per-panel required-fields lookup table (`REQUIRED_URL_FIELDS_BY_PANEL`) rather than duplicated per-panel branches. Detail page shows a "Kelengkapan Panel Sains dan Teknologi/Sosial dan Humaniora" card with clickable links when present. Verified live end-to-end via Playwright for both panels independently: Panel Type options render correctly; email/phone fields are genuinely `disabled` (excluded from form submission) and match the logged-in user's real DB values; switching the dropdown correctly swaps the panel-specific fields in and out (confirmed both directions: SAINTEK->SOSHUM shows the 2 extra SOSHUM fields, SOSHUM->SAINTEK hides them again); both a full SAINTEK submission and a full SOSHUM submission persist all their respective fields correctly per direct SQL inspection (SOSHUM's `saintekFormUrl` column correctly `NULL` and vice versa). Test data cleaned up afterward.

- **Git repository initialized**: `git init`, branch renamed to `main`, verified `.gitignore` actually excludes `.env`/`node_modules`/`.next`/`public/uploads` before staging (checked `git status --short` for leaked secrets/build artifacts), then a single initial commit - 96 files, all source + the 4 committed migrations, no secrets.
- **Full visual redesign**: Tailwind CSS v4 (CSS-first config, no `tailwind.config.js` needed - `@theme`/`@apply` directly in `app/globals.css`), self-hosted Inter via `next/font/google` (zero external font requests, `display: swap`, no CLS). Every existing custom class (`.btn`, `.card`, `.field`, `.badge`, `.data-table`, `.app-header`, etc.) was reimplemented with Tailwind's `@layer components` + `@apply` under the *same* class names, so no component `.tsx` file needed its className props touched for the restyle itself. New design: indigo/slate palette on CSS variables (not hardcoded), auto dark mode via `prefers-color-scheme` (no toggle UI, no JS), sticky/blurred header with active-pill nav, rounded-2xl cards with soft shadows, styled file-input buttons (previously totally unstyled - text inputs were only styled inside `.field`, so free-standing inputs like the plenary-meeting external-member rows and every file input had zero styling; restructured to style text-like inputs globally instead of `.field`-scoped), subtle gradient auth-page background, `prefers-reduced-motion` support.
  Accessibility (WCAG 2.1 AA): added a skip-to-content link (`#main-content`, focusable target on every page including the two auth pages, which needed converting to `<main>` landmarks), an `sr-only` label on the previously-blank document-actions table header, and verified every foreground/background color pair numerically (relative-luminance contrast formula, not eyeballing) - all 12 pairs checked (light + dark, text/muted/button/link/success-badge/error-badge) clear 4.5:1+ AA for normal text, ranging 5.2:1-17:1.
  Performance: compiled CSS is ~6KB gzipped for the entire app (Tailwind purges to only the classes actually used).
  Responsiveness: all 7 `<table className="data-table">` usages wrapped in a new `.table-scroll` (`overflow-x-auto`) container so wide tables scroll horizontally on narrow screens instead of breaking layout; removed the last 4 stray inline `style={{...}}` attributes in favor of Tailwind utilities for consistency.
  Verified live (not just built): `next build` stays clean, then real Playwright screenshots at both 1440px and 390px viewports for login, register, an empty dashboard, and the full new-application form (the highest field-density page) - captured and visually reviewed, zero console errors - plus a dedicated dark-mode screenshot (Playwright `colorScheme: 'dark'`) confirming the OS-preference path actually renders correctly, not just in theory. Test data cleaned up afterward.
- **Made the codebase Vercel-deployable** (client wants to demo the app via a Vercel URL before a CloudPanel VPS exists). The app was built entirely around a persistent-disk VPS model, which Vercel's serverless functions don't provide (ephemeral filesystem, no local DB, no crontab), so this was real code changes, not just docs:
  - `lib/storage.ts` rewritten as dual-mode: local disk (unchanged default, zero setup for local dev/CloudPanel) or **Vercel Blob**, auto-selected by the presence of `BLOB_READ_WRITE_TOKEN`. `writeFile`/`readFile`/`deleteFile` replace the old disk-only `writeFileToDisk`/`resolveUploadPath`; `Document.filePath` now holds either a relative disk path or a full Blob URL - no schema change needed. Updated all 4 call sites (`lib/documents.ts`, `lib/finalize-approval.ts`, `app/api/documents/[id]/route.ts`, `app/actions/delete-document.ts`).
  - Deadline-reminder logic extracted from `scripts/send-deadline-reminders.ts` into `lib/deadline-reminders.ts` (`runDeadlineReminders()`), now called by both the original CLI script (CloudPanel cron) and a new `app/api/cron/reminders/route.ts` (Vercel Cron), gated by a `CRON_SECRET` bearer-token check. `vercel.json` schedules it daily at `0 0 * * *` UTC (07:00 WIB, matching the original CloudPanel cron time).
  - `next.config.js`: `output: 'standalone'` (needed for CloudPanel) is now skipped when `process.env.VERCEL` is set, since Vercel manages its own build/runtime format.
  - Added `@vercel/blob` dependency. Hit and fixed one incidental typecheck error surfaced along the way: `next/server`'s `NextResponse` in this TS/lib version doesn't structurally accept a bare `Buffer` as `BodyInit` once it's returned through a named helper function (it did when inlined via `fs.readFile()` directly) - fixed by wrapping in `new Uint8Array(fileBuffer)` at the one call site, unrelated to Blob itself.
  - Added a full "Deployment (Vercel)" section to README.md alongside the existing CloudPanel one; both paths coexist untouched (verified `npm run typecheck` and `next build` stay clean throughout).
- **Public Portal & Pages Implemented**:
  - `app/page.tsx` transformed from an immediate redirect into an institutional landing portal with hero overview, role-aware dashboard/registration CTAs, 3-track explanation (*Exempted*, *Expedited*, *Full Board*), 5-milestone SLA timeline, and panel highlights (SAINTEK & SOSHUM).
  - `app/tentang/profil/page.tsx`: institutional background, vision & mission, Tupoksi, ethical guidelines, and legal foundation with clearly marked customization placeholders.
  - `app/tentang/struktur-organisasi/page.tsx`: organizational hierarchy covering leadership (Pelindung, Pengarah, Ketua & Sekretaris), secretariat, and review panels with member cards and marked placeholders.
  - `app/kontak/page.tsx`: secretariat address, emails, service hours, interactive categorized inquiry form (`components/contact/contact-form.tsx`), and FAQ.
  - Shared layout components: `components/layout/public-header.tsx` (with dropdown & mobile drawer), `components/layout/public-footer.tsx`, and `components/layout/public-shell.tsx`.
  - Added back-to-home navigation links in login/register forms and linked internal dashboard brand headers back to home.
- **Vercel & Free Cloud Database Deployment (Live & Verified)**:
  - Configured zero-cost database with **TiDB Cloud Serverless** (MySQL 8 compatible, 5 GB storage free forever, no credit card required).
  - Applied all 4 Prisma migrations and seeded initial staff accounts directly into the TiDB cloud database.
  - Added `scripts/check-users.ts` and `npm run users:check` script to inspect live database accounts and verify bcrypt password hashes.
  - Fixed Vercel build caching issue: updated `package.json` to run `prisma generate` during `build` and `postinstall`.
  - Fixed Next.js 14 App Router static build collection errors by declaring `export const dynamic = 'force-dynamic'` on API route handlers (`/api/auth/[...nextauth]`, `/api/cron/reminders`, `/api/documents/[id]`).
  - Fixed NextAuth runtime `[next-auth][error][NO_SECRET]` in production by explicitly specifying `secret` with a fallback in `lib/auth.ts`.
  - Added `.trim().toLowerCase()` to email authentication in `lib/auth.ts` to prevent mobile keyboard auto-capitalization issues.
  - Safely initialized `lib/resend.ts` to avoid top-level fatal crashes if `RESEND_API_KEY` is not provided at build-time.
  - Pushed all commits to GitHub repository: `https://github.com/msaluck/ec-kep-lppm-unsoed.git`.

## Not done

**Never tested against anything real**
- No verified Resend sending domain yet - real delivery only works to the Resend account owner's own address until `resend.com/domains` is set up; every other recipient will 403 until then
- Zero automated tests (unit/integration/e2e) - every smoke test so far has been a manual one-off script, deleted after use, not a repeatable test suite

**Deployment (CloudPanel VPS)**
- No CloudPanel site created yet, no real `.env` with production secrets on VPS, no VPS cron entry actually installed (live cloud trial currently operates on Vercel + TiDB Cloud Serverless)
