import Link from 'next/link';
import { requireRole } from '@/lib/require-session';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { DeadlineBadge } from '@/components/applications/deadline-badge';
import { PAGE_SIZE, Pagination, parsePage } from '@/components/layout/pagination';

export default async function ReviewerAssignmentsPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await requireRole(['REVIEWER']);
  const page = parsePage(searchParams.page);

  const [assignments, total] = await Promise.all([
    prisma.reviewAssignment.findMany({
      where: { reviewerId: session.user.id, vote: 'PENDING' },
      include: { application: true },
      orderBy: { deadline: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.reviewAssignment.count({ where: { reviewerId: session.user.id, vote: 'PENDING' } }),
  ]);

  return (
    <PageShell title="Penugasan Telaah Saya">
      {assignments.length === 0 ? (
        <div className="empty-state">Tidak ada penugasan telaah yang menunggu suara Anda.</div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Judul</th>
                  <th>Batas Waktu</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <Link href={`/applications/${assignment.applicationId}`}>
                        {assignment.application.applicationNumber}
                      </Link>
                    </td>
                    <td>{assignment.application.title}</td>
                    <td>
                      <DeadlineBadge deadline={assignment.deadline} label="Batas Telaah" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} basePath="/reviewer/assignments" />
        </>
      )}
    </PageShell>
  );
}
