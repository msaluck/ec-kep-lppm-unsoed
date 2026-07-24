import type { Application, ApplicationStatus } from '@prisma/client';

type DeadlineFields = Pick<
  Application,
  'status' | 'secretariatDeadline' | 'classificationDeadline' | 'reviewDeadline' | 'finalDecisionDeadline' | 'resubmissionDeadline'
>;

const DEADLINE_BY_STATUS: Partial<Record<ApplicationStatus, { field: keyof DeadlineFields; label: string }>> = {
  SUBMITTED: { field: 'secretariatDeadline', label: 'Batas Pemeriksaan Sekretariat' },
  FORWARDED_TO_CHAIRMAN: { field: 'classificationDeadline', label: 'Batas Klasifikasi Ketua' },
  EXPEDITED_ASSIGNED: { field: 'reviewDeadline', label: 'Batas Telaah' },
  EXPEDITED_REVIEWING: { field: 'reviewDeadline', label: 'Batas Telaah' },
  FULL_BOARD_SCHEDULING: { field: 'reviewDeadline', label: 'Batas Rapat Pleno' },
  FULL_BOARD_MEETING: { field: 'reviewDeadline', label: 'Batas Rapat Pleno' },
  PENDING_FINAL_DECISION: { field: 'finalDecisionDeadline', label: 'Batas Keputusan Akhir' },
  REVISION_1_SUBMITTED: { field: 'finalDecisionDeadline', label: 'Batas Keputusan Akhir' },
  REVISION_2_SUBMITTED: { field: 'finalDecisionDeadline', label: 'Batas Keputusan Akhir' },
  REVISION_REQUIRED: { field: 'resubmissionDeadline', label: 'Batas Pengajuan Ulang' },
};

// The single deadline currently in force for an application, derived from
// its status - used to surface "what's due, and when" on list/detail pages
// without every caller re-deriving the status -> deadline-field mapping.
export function getCurrentDeadline(application: DeadlineFields): { deadline: Date | null; label: string } | null {
  const mapping = DEADLINE_BY_STATUS[application.status];
  if (!mapping) return null;

  return { deadline: application[mapping.field] as Date | null, label: mapping.label };
}
