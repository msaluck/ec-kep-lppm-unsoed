import Link from 'next/link';
import { requireRole } from '@/lib/require-session';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { DeadlineBadge } from '@/components/applications/deadline-badge';
import { PAGE_SIZE, Pagination, parsePage } from '@/components/layout/pagination';

export default async function SecretariatQueuePage({ searchParams }: { searchParams: { page?: string } }) {
  await requireRole(['SECRETARIAT']);
  const page = parsePage(searchParams.page);

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: { status: 'SUBMITTED' },
      include: { researcher: { select: { name: true, institution: true } } },
      orderBy: { secretariatDeadline: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.application.count({ where: { status: 'SUBMITTED' } }),
  ]);

  return (
    <PageShell title="Antrean Pemeriksaan Kelengkapan">
      {applications.length === 0 ? (
        <div className="empty-state">Tidak ada aplikasi yang menunggu pemeriksaan.</div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Judul</th>
                  <th>Peneliti</th>
                  <th>Batas Waktu</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <Link href={`/applications/${application.id}`}>{application.applicationNumber}</Link>
                    </td>
                    <td>{application.title}</td>
                    <td>{application.researcher.name}</td>
                    <td>
                      <DeadlineBadge deadline={application.secretariatDeadline} label="Batas Pemeriksaan" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} basePath="/secretariat/queue" />
        </>
      )}
    </PageShell>
  );
}
