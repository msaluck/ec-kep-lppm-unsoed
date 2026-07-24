import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/require-session';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { UserDetailActions } from '@/components/admin/user-detail-actions';

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const session = await requireRole(['ADMIN']);

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    notFound();
  }

  return (
    <PageShell title={user.name}>
      <div className="card">
        <h2>Detail Pengguna</h2>
        <dl className="detail-grid">
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Peran</dt>
          <dd>{user.role}</dd>
          <dt>Institusi</dt>
          <dd>{user.institution ?? '-'}</dd>
          <dt>No. Telepon</dt>
          <dd>{user.phone ?? '-'}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`badge${user.isActive ? '' : ' rejected'}`}>{user.isActive ? 'Aktif' : 'Nonaktif'}</span>
          </dd>
          <dt>Terdaftar</dt>
          <dd>{user.createdAt.toLocaleDateString('id-ID')}</dd>
        </dl>
      </div>

      <UserDetailActions userId={user.id} isActive={user.isActive} isSelf={user.id === session.user.id} />
    </PageShell>
  );
}
