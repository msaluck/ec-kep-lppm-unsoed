import { STATUS_LABELS } from '@/lib/status-labels';
import type { ApplicationStatus } from '@prisma/client';

type TimelineEntry = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  notes: string | null;
  deadlineAt: Date | null;
  createdAt: Date;
  actor: { name: string } | null;
};

export function StatusTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return <p>Belum ada riwayat.</p>;

  return (
    <ul className="timeline">
      {entries.map((entry) => (
        <li key={entry.id}>
          <div>
            {entry.fromStatus ? `${STATUS_LABELS[entry.fromStatus]} -> ` : ''}
            <strong>{STATUS_LABELS[entry.toStatus]}</strong>
          </div>
          <div className="timeline-meta">
            {entry.createdAt.toLocaleString('id-ID')}
            {entry.actor ? ` - ${entry.actor.name}` : ''}
            {entry.deadlineAt ? ` - Batas: ${entry.deadlineAt.toLocaleDateString('id-ID')}` : ''}
          </div>
          {entry.notes && <div>{entry.notes}</div>}
        </li>
      ))}
    </ul>
  );
}
