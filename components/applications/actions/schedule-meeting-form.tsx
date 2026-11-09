'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { schedulePlenaryMeeting } from '@/app/actions/schedule-plenary-meeting';

type MemberOption = { id: string; name: string; email: string; role: string };
type ExternalRow = { name: string; institution: string; email: string };

const EMPTY_EXTERNAL_ROW: ExternalRow = { name: '', institution: '', email: '' };

export function ScheduleMeetingForm({
  applicationId,
  internalMembers,
}: {
  applicationId: string;
  internalMembers: MemberOption[];
}) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInternal, setSelectedInternal] = useState<string[]>([]);
  const [externalRows, setExternalRows] = useState<ExternalRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleInternal(id: string) {
    setSelectedInternal((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  function updateExternalRow(index: number, field: keyof ExternalRow, value: string) {
    setExternalRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const participants = [
      ...selectedInternal.map((userId) => ({ userId })),
      ...externalRows
        .filter((row) => row.name.trim().length > 0)
        .map((row) => ({
          externalName: row.name,
          externalInstitution: row.institution || undefined,
          externalEmail: row.email || undefined,
        })),
    ];

    if (participants.length === 0) {
      setError('Tambahkan minimal satu anggota rapat.');
      return;
    }

    setIsSubmitting(true);
    const result = await schedulePlenaryMeeting({
      applicationId,
      scheduledAt: new Date(scheduledAt),
      location: location || undefined,
      participants,
    });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Jadwalkan Rapat Pleno</h2>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="scheduledAt">Tanggal &amp; Waktu</label>
          <input
            id="scheduledAt"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="location">Lokasi</label>
          <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="field">
          <label>Anggota Internal</label>
          {internalMembers.map((member) => (
            <div className="checkbox-row" key={member.id}>
              <input
                type="checkbox"
                id={`member-${member.id}`}
                checked={selectedInternal.includes(member.id)}
                onChange={() => toggleInternal(member.id)}
              />
              <label htmlFor={`member-${member.id}`}>
                {member.name} ({member.role})
              </label>
            </div>
          ))}
        </div>

        <div className="field">
          <label>Anggota Eksternal</label>
          {externalRows.map((row, index) => (
            <div key={index} className="action-row mb-2">
              <input
                placeholder="Nama"
                value={row.name}
                onChange={(e) => updateExternalRow(index, 'name', e.target.value)}
              />
              <input
                placeholder="Institusi"
                value={row.institution}
                onChange={(e) => updateExternalRow(index, 'institution', e.target.value)}
              />
              <input
                placeholder="Email (opsional)"
                value={row.email}
                onChange={(e) => updateExternalRow(index, 'email', e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="btn secondary" onClick={() => setExternalRows((r) => [...r, { ...EMPTY_EXTERNAL_ROW }])}>
            + Tambah Anggota Eksternal
          </button>
        </div>

        <button type="submit" className="btn mt-4" disabled={isSubmitting}>
          {isSubmitting ? 'Menjadwalkan...' : 'Jadwalkan Rapat'}
        </button>
      </form>
    </div>
  );
}
