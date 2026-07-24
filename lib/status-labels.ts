import type { ApplicationStatus, PanelType, ReviewTrack, ReviewVote } from '@prisma/client';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Menunggu Pemeriksaan Sekretariat',
  RETURNED_INCOMPLETE: 'Dikembalikan (Tidak Lengkap)',
  FORWARDED_TO_CHAIRMAN: 'Menunggu Klasifikasi Ketua',
  EXEMPTED_PROCESSING: 'Proses Surat Bebas Kaji Etik',
  EXPEDITED_ASSIGNED: 'Menunggu Telaah (Expedited)',
  EXPEDITED_REVIEWING: 'Sedang Ditelaah (Expedited)',
  FULL_BOARD_SCHEDULING: 'Menunggu Jadwal Rapat Pleno',
  FULL_BOARD_MEETING: 'Rapat Pleno Berlangsung',
  PENDING_FINAL_DECISION: 'Menunggu Keputusan Akhir',
  APPROVED: 'Disetujui (Persetujuan Etik)',
  REVISION_REQUIRED: 'Perlu Revisi',
  REJECTED: 'Tidak Disetujui',
  REVISION_1_SUBMITTED: 'Revisi I Diterima - Menunggu Keputusan',
  REVISION_2_SUBMITTED: 'Revisi II Diterima - Menunggu Keputusan',
};

export const TRACK_LABELS: Record<ReviewTrack, string> = {
  EXEMPTED: 'Exempted',
  EXPEDITED: 'Expedited',
  FULL_BOARD: 'Full Board',
};

export const PANEL_TYPE_LABELS: Record<PanelType, string> = {
  SAINTEK: 'Panel Sains dan Teknologi',
  SOSHUM: 'Panel Sosial dan Humaniora',
};

export const VOTE_LABELS: Record<ReviewVote, string> = {
  PENDING: 'Menunggu',
  AGREE: 'Sepakat',
  DISAGREE: 'Tidak Sepakat',
};

export function statusBadgeVariant(status: ApplicationStatus): 'approved' | 'rejected' | 'neutral' {
  if (status === 'APPROVED') return 'approved';
  if (status === 'REJECTED' || status === 'RETURNED_INCOMPLETE') return 'rejected';
  return 'neutral';
}
