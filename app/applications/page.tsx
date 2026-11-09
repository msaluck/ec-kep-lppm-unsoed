import Link from 'next/link';
import { requireRole } from '@/lib/require-session';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { StatusBadge } from '@/components/applications/status-badge';
import { DeadlineBadge } from '@/components/applications/deadline-badge';
import { getCurrentDeadline } from '@/lib/current-deadline';
import { PAGE_SIZE, Pagination, parsePage } from '@/components/layout/pagination';

export default async function ApplicationsPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await requireRole(['RESEARCHER']);
  const page = parsePage(searchParams.page);

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: { researcherId: session.user.id },
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.application.count({ where: { researcherId: session.user.id } }),
  ]);

  return (
    <PageShell
      title="Aplikasi Saya"
      actions={
        <Link href="/applications/new" className="btn">
          + Ajukan Baru
        </Link>
      }
    >
      {applications.length === 0 ? (
        <div className="empty-state">Belum ada aplikasi yang diajukan.</div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Batas Waktu</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const deadlineInfo = getCurrentDeadline(application);
                  return (
                    <tr key={application.id}>
                      <td>
                        <Link href={`/applications/${application.id}`}>{application.applicationNumber}</Link>
                      </td>
                      <td>{application.title}</td>
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
          </div>
          <Pagination page={page} total={total} basePath="/applications" />
        </>
      )}
    </PageShell>
  );
}
