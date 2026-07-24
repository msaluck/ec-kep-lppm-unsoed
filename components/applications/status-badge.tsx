import type { ApplicationStatus } from '@prisma/client';
import { STATUS_LABELS, statusBadgeVariant } from '@/lib/status-labels';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const variant = statusBadgeVariant(status);
  return <span className={`badge${variant !== 'neutral' ? ` ${variant}` : ''}`}>{STATUS_LABELS[status]}</span>;
}
