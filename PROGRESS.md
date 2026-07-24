# Progress - EC-KEP LPPM Unsoed

Last updated: 2026-07-23

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

## Not done

**Never tested against anything real**
- No verified Resend sending domain yet - real delivery only works to the Resend account owner's own address until `resend.com/domains` is set up; every other recipient will 403 until then
- Zero automated tests (unit/integration/e2e) - every smoke test so far has been a manual one-off script, deleted after use, not a repeatable test suite

**Deployment (nothing done yet)**
- No CloudPanel site created, no real `.env` with production secrets, no `prisma migrate deploy` against production, no cron entry actually installed, no SSL/domain setup
- Repo is still not a git repository - nothing has been committed anywhere
