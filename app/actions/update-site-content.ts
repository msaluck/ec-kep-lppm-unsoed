'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/require-session';
import { saveSiteContent } from '@/lib/site-content';

const ALLOWED_KEYS = ['home', 'profile', 'organization', 'contact'] as const;
type ContentKey = (typeof ALLOWED_KEYS)[number];

export async function updateSiteContent({
  key,
  data,
}: {
  key: ContentKey;
  data: unknown;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await requireRole(['ADMIN']);

    if (!ALLOWED_KEYS.includes(key)) {
      return { success: false, error: 'Kategori konten tidak valid.' };
    }

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Data konten tidak boleh kosong.' };
    }

    await saveSiteContent(key, data, session.user.id);

    // Revalidate affected routes
    revalidatePath('/');
    revalidatePath('/tentang/profil');
    revalidatePath('/tentang/struktur-organisasi');
    revalidatePath('/kontak');
    revalidatePath('/admin/content');

    return { success: true };
  } catch (err) {
    console.error('updateSiteContent error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan konten.',
    };
  }
}
