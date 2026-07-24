import Link from 'next/link';

export const PAGE_SIZE = 20;

export function parsePage(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function Pagination({
  page,
  total,
  pageSize = PAGE_SIZE,
  basePath,
}: {
  page: number;
  total: number;
  pageSize?: number;
  basePath: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const separator = basePath.includes('?') ? '&' : '?';
  const pageHref = (targetPage: number) => `${basePath}${separator}page=${targetPage}`;

  return (
    <div className="pagination">
      {page > 1 ? (
        <Link href={pageHref(page - 1)}>&laquo; Sebelumnya</Link>
      ) : (
        <span className="disabled">&laquo; Sebelumnya</span>
      )}
      <span>
        Halaman {page} dari {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageHref(page + 1)}>Selanjutnya &raquo;</Link>
      ) : (
        <span className="disabled">Selanjutnya &raquo;</span>
      )}
    </div>
  );
}
