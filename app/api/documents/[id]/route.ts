import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from '@/lib/storage';

// Streams a document from storage (local disk or Vercel Blob - see
// lib/storage.ts) after re-running the same authorization rule as the
// application detail page (owner researcher, Secretariat, Chairman, or an
// assigned reviewer) - document URLs are otherwise guessable cuids, not
// access tokens.
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      application: {
        include: { reviewAssignments: { select: { reviewerId: true } } },
      },
    },
  });

  if (!document) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const { role, id: userId } = session.user;
  const isAuthorized =
    (role === 'RESEARCHER' && document.application.researcherId === userId) ||
    role === 'SECRETARIAT' ||
    role === 'CHAIRMAN' ||
    (role === 'REVIEWER' && document.application.reviewAssignments.some((a) => a.reviewerId === userId));

  if (!isAuthorized) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const fileBuffer = await readFile(document.filePath);
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
      },
    });
  } catch {
    return new NextResponse('File not found in storage', { status: 404 });
  }
}
