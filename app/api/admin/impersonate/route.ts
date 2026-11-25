import { NextRequest, NextResponse } from 'next/server';
import { getToken, encode } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import type { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

const ROLE_REDIRECTS: Record<Role, string> = {
  RESEARCHER: '/applications',
  SECRETARIAT: '/secretariat/queue',
  CHAIRMAN: '/chairman/queue',
  REVIEWER: '/reviewer/assignments',
  ADMIN: '/admin/users',
};

export async function POST(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || 'LlztzX9dlWfFxElgG19+D9lb3WgF8Vata8SrD3HeTXk=';
  const token = await getToken({ req, secret });

  if (!token) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan. Silakan login kembali.' }, { status: 401 });
  }

  const isActuallyAdmin = token.role === 'ADMIN' || token.impersonator?.role === 'ADMIN';
  if (!isActuallyAdmin) {
    return NextResponse.json({ error: 'Akses ditolak: Hanya akun ADMIN yang memiliki izin impersonasi.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, targetUserId } = body as { action?: string; targetUserId?: string };

    const isSecure = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

    if (action === 'stop') {
      // Revert back to original Admin account
      if (!token.impersonator?.id) {
        return NextResponse.json({ error: 'Tidak ada sesi impersonasi yang sedang aktif.' }, { status: 400 });
      }

      const originalAdmin = await prisma.user.findUnique({
        where: { id: token.impersonator.id },
      });

      if (!originalAdmin || originalAdmin.role !== 'ADMIN' || !originalAdmin.isActive) {
        return NextResponse.json({ error: 'Akun Admin asal tidak valid atau telah dinonaktifkan.' }, { status: 400 });
      }

      const newToken = {
        ...token,
        id: originalAdmin.id,
        name: originalAdmin.name,
        email: originalAdmin.email,
        role: originalAdmin.role,
        impersonator: undefined,
      };

      const sessionCookieValue = await encode({ token: newToken, secret, maxAge: 30 * 24 * 60 * 60 });

      const response = NextResponse.json({
        success: true,
        message: 'Berhasil menghentikan impersonasi. Kembali ke akun Admin.',
        redirectUrl: '/admin/users',
      });

      response.cookies.set({
        name: cookieName,
        value: sessionCookieValue,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    if (action === 'impersonate') {
      if (!targetUserId || typeof targetUserId !== 'string') {
        return NextResponse.json({ error: 'targetUserId wajib disertakan.' }, { status: 400 });
      }

      // If already impersonating, use the original admin info
      const originalAdminId = token.impersonator?.id || token.id;
      const originalAdmin = await prisma.user.findUnique({
        where: { id: originalAdminId },
      });

      if (!originalAdmin || originalAdmin.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya Admin yang sah yang dapat melakukan impersonasi.' }, { status: 403 });
      }

      if (targetUserId === originalAdmin.id) {
        return NextResponse.json({ error: 'Anda sudah login sebagai akun Admin ini.' }, { status: 400 });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser || !targetUser.isActive) {
        return NextResponse.json({ error: 'Pengguna target tidak ditemukan atau sedang nonaktif.' }, { status: 404 });
      }

      const newToken = {
        ...token,
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        impersonator: {
          id: originalAdmin.id,
          name: originalAdmin.name,
          email: originalAdmin.email,
          role: originalAdmin.role,
        },
      };

      const sessionCookieValue = await encode({ token: newToken, secret, maxAge: 30 * 24 * 60 * 60 });

      const redirectUrl = ROLE_REDIRECTS[targetUser.role] || '/applications';

      const response = NextResponse.json({
        success: true,
        message: `Berhasil masuk sebagai ${targetUser.name} (${targetUser.role}).`,
        redirectUrl,
      });

      response.cookies.set({
        name: cookieName,
        value: sessionCookieValue,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal. Gunakan "impersonate" atau "stop".' }, { status: 400 });
  } catch (err) {
    console.error('Impersonation error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan internal saat memproses impersonasi.' }, { status: 500 });
  }
}
