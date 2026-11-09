import Link from 'next/link';
import { requireRole } from '@/lib/require-session';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { PAGE_SIZE, Pagination, parsePage } from '@/components/layout/pagination';
import type { Role } from '@prisma/client';

const ROLE_FILTERS: Role[] = ['RESEARCHER', 'SECRETARIAT', 'CHAIRMAN', 'REVIEWER', 'ADMIN'];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; role?: string };
}) {
  await requireRole(['ADMIN']);
  const page = parsePage(searchParams.page);
  const roleFilter = ROLE_FILTERS.includes(searchParams.role as Role) ? (searchParams.role as Role) : undefined;

  const where = roleFilter ? { role: roleFilter } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const basePath = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users';

  return (
    <PageShell
      title="Manajemen Pengguna"
      actions={
        <Link href="/admin/users/new" className="btn">
          + Tambah Pengguna
        </Link>
      }
    >
      <div className="action-row mb-4">
        <Link href="/admin/users" className={!roleFilter ? 'btn' : 'btn secondary'}>
          Semua
        </Link>
        {ROLE_FILTERS.map((role) => (
          <Link key={role} href={`/admin/users?role=${role}`} className={roleFilter === role ? 'btn' : 'btn secondary'}>
            {role}
          </Link>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="empty-state">Tidak ada pengguna.</div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Peran</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Link href={`/admin/users/${user.id}`}>{user.name}</Link>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`badge${user.isActive ? '' : ' rejected'}`}>
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} basePath={basePath} />
        </>
      )}
    </PageShell>
  );
}
