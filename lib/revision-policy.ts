// Shared by decide-final-outcome.ts (resubmission deadline) and
// resubmit-revision.ts (post-resubmission decision deadline) — both use
// the same day counts per round: Revisi I = 10 working days, Revisi II = 5.
export const REVISION_ROUND_DEADLINE_DAYS = [10, 5] as const;
export const MAX_REVISION_ROUNDS = REVISION_ROUND_DEADLINE_DAYS.length;
