import Link from 'next/link';
import { requireRole } from '@/lib/require-session';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { StatusBadge } from '@/components/applications/status-badge';
import { DeadlineBadge } from '@/components/applications/deadline-badge';
import { getCurrentDeadline } from '@/lib/current-deadline';
import { PAGE_SIZE, Pagination, parsePage } from '@/components/layout/pagination';
import type { ApplicationStatus } from '@prisma/client';

const CHAIRMAN_ACTIONABLE_STATUSES: ApplicationStatus[] = [
  'FORWARDED_TO_CHAIRMAN',
  'EXEMPTED_PROCESSING',
  'FULL_BOARD_SCHEDULING',
  'FULL_BOARD_MEETING',
  'PENDING_FINAL_DECISION',
  'REVISION_1_SUBMITTED',
  'REVISION_2_SUBMITTED',
];

export default async function ChairmanQueuePage({ searchParams }: { searchParams: { page?: string } }) {
  await requireRole(['CHAIRMAN']);
  const page = parsePage(searchParams.page);

  // Sorted by a computed deadline spanning several different columns (see
  // getCurrentDeadline), so this has to fetch everything actionable and
  // sort in memory - pagination below slices the already-sorted array
  // rather than using a DB-level skip/take, which would paginate before
  // the sort and return the wrong rows.
  const applications = await prisma.application.findMany({
    where: { status: { in: CHAIRMAN_ACTIONABLE_STATUSES } },
    include: { researcher: { select: { name: true } } },
  });

  const sorted = [...applications].sort((a, b) => {
    const deadlineA = getCurrentDeadline(a)?.deadline?.getTime() ?? Infinity;
    const deadlineB = getCurrentDeadline(b)?.deadline?.getTime() ?? Infinity;
    return deadlineA - deadlineB;
  });

  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell title="Antrean Keputusan Ketua/Sekretaris">
      {sorted.length === 0 ? (
        <div className="empty-state">Tidak ada aplikasi yang menunggu tindakan.</div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Judul</th>
                <th>Peneliti</th>
                <th>Status</th>
                <th>Batas Waktu</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((application) => {
                const deadlineInfo = getCurrentDeadline(application);
                return (
                  <tr key={application.id}>
                    <td>
                      <Link href={`/applications/${application.id}`}>{application.applicationNumber}</Link>
                    </td>
                    <td>{application.title}</td>
                    <td>{application.researcher.name}</td>
                    <td>
                      <StatusBadge status={application.status} />
                    </td>
                    <td>
                      {deadlineInfo && <DeadlineBadge deadline={deadlineInfo.deadline} label={deadlineInfo.label} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} total={sorted.length} basePath="/chairman/queue" />
        </>
      )}
    </PageShell>
  );
}
