'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/update-profile';

type ProfileFormProps = {
  initialName: string;
  initialInstitution: string;
  initialPhone: string;
};

export function ProfileForm({ initialName, initialInstitution, initialPhone }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [institution, setInstitution] = useState(initialInstitution);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const result = await updateProfile({ name, institution: institution || undefined, phone: phone || undefined });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Informasi Profil</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">Profil berhasil diperbarui.</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Nama Lengkap</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="institution">Institusi</label>
          <input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="phone">No. Telepon</label>
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>
    </div>
  );
}
