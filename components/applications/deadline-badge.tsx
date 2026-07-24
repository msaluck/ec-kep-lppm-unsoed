import { isOverdue } from '@/lib/working-days';

export function DeadlineBadge({ deadline, label }: { deadline: Date | null; label: string }) {
  if (!deadline) return null;
  const overdue = isOverdue(deadline);

  return (
    <span className={`badge${overdue ? ' overdue' : ''}`}>
      {label}: {deadline.toLocaleDateString('id-ID')}
      {overdue ? ' (Lewat batas)' : ''}
    </span>
  );
}
