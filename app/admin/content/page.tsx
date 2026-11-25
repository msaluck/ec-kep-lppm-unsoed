import { requireRole } from '@/lib/require-session';
import { PageShell } from '@/components/layout/page-shell';
import {
  getSiteContent,
  DEFAULT_HOME_CONTENT,
  DEFAULT_PROFILE_CONTENT,
  DEFAULT_ORGANIZATION_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  type HomeContent,
  type ProfileContent,
  type OrganizationContent,
  type ContactContent,
} from '@/lib/site-content';
import { ContentManager } from '@/components/admin/content-manager';

export const metadata = {
  title: 'Kelola Konten Publik - EC-KEP LPPM Unsoed',
  description: 'Pengaturan dan pembaruan konten publik institusional EC-KEP LPPM Unsoed',
};

export default async function AdminContentPage() {
  await requireRole(['ADMIN']);

  const [home, profile, organization, contact] = await Promise.all([
    getSiteContent<HomeContent>('home', DEFAULT_HOME_CONTENT),
    getSiteContent<ProfileContent>('profile', DEFAULT_PROFILE_CONTENT),
    getSiteContent<OrganizationContent>('organization', DEFAULT_ORGANIZATION_CONTENT),
    getSiteContent<ContactContent>('contact', DEFAULT_CONTACT_CONTENT),
  ]);

  return (
    <PageShell title="Kelola Konten Publik">
      <ContentManager
        initialHome={home}
        initialProfile={profile}
        initialOrganization={organization}
        initialContact={contact}
      />
    </PageShell>
  );
}
