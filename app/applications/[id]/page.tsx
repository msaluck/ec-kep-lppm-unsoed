import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { StatusBadge } from '@/components/applications/status-badge';
import { DeadlineBadge } from '@/components/applications/deadline-badge';
import { DocumentsList } from '@/components/applications/documents-list';
import { StatusTimeline } from '@/components/applications/status-timeline';
import { getCurrentDeadline } from '@/lib/current-deadline';
import { PANEL_TYPE_LABELS, TRACK_LABELS, VOTE_LABELS } from '@/lib/status-labels';
import { CompletenessForm } from '@/components/applications/actions/completeness-form';
import { ClassifyForm } from '@/components/applications/actions/classify-form';
import { ExemptionApprovalForm } from '@/components/applications/actions/exemption-approval-form';
import { ScheduleMeetingForm } from '@/components/applications/actions/schedule-meeting-form';
import { CompleteMeetingForm } from '@/components/applications/actions/complete-meeting-form';
import { FinalDecisionForm } from '@/components/applications/actions/final-decision-form';
import { VoteForm } from '@/components/applications/actions/vote-form';
import { ResubmitRevisionForm } from '@/components/applications/actions/resubmit-revision-form';
import { AddDocumentForm } from '@/components/applications/actions/add-document-form';

const FINAL_DECISION_STATUSES = ['PENDING_FINAL_DECISION', 'REVISION_1_SUBMITTED', 'REVISION_2_SUBMITTED'];
const EXPEDITED_VOTING_STATUSES = ['EXPEDITED_ASSIGNED', 'EXPEDITED_REVIEWING'];

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      researcher: true,
      chairman: true,
      secretariatCheckedBy: true,
      documents: { orderBy: { uploadedAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'asc' }, include: { actor: { select: { name: true } } } },
      reviewAssignments: { include: { reviewer: { select: { id: true, name: true, email: true } } } },
      plenaryMeeting: { include: { participants: { include: { user: { select: { name: true } } } } } },
    },
  });

  if (!application) {
    notFound();
  }

  const { role, id: userId } = session.user;
  const myAssignment = application.reviewAssignments.find((a) => a.reviewerId === userId);

  const isAuthorized =
    (role === 'RESEARCHER' && application.researcherId === userId) ||
    role === 'SECRETARIAT' ||
    role === 'CHAIRMAN' ||
    (role === 'REVIEWER' && Boolean(myAssignment));

  if (!isAuthorized) {
    notFound();
  }

  const deadlineInfo = getCurrentDeadline(application);
  const canManageDocuments =
    role === 'RESEARCHER' && application.researcherId === userId && application.status === 'SUBMITTED';

  let actionPanel: React.ReactNode = null;

  if (role === 'SECRETARIAT' && application.status === 'SUBMITTED') {
    actionPanel = <CompletenessForm applicationId={application.id} />;
  } else if (role === 'CHAIRMAN' && application.status === 'FORWARDED_TO_CHAIRMAN') {
    const reviewers = await prisma.user.findMany({
      where: { role: 'REVIEWER', isActive: true },
      select: { id: true, name: true, email: true },
    });
    actionPanel = <ClassifyForm applicationId={application.id} reviewers={reviewers} />;
  } else if (role === 'CHAIRMAN' && application.status === 'EXEMPTED_PROCESSING') {
    actionPanel = <ExemptionApprovalForm applicationId={application.id} />;
  } else if ((role === 'CHAIRMAN' || role === 'SECRETARIAT') && application.status === 'FULL_BOARD_SCHEDULING') {
    const internalMembers = await prisma.user.findMany({
      where: { role: { in: ['CHAIRMAN', 'REVIEWER', 'SECRETARIAT'] }, isActive: true },
      select: { id: true, name: true, email: true, role: true },
    });
    actionPanel = <ScheduleMeetingForm applicationId={application.id} internalMembers={internalMembers} />;
  } else if ((role === 'CHAIRMAN' || role === 'SECRETARIAT') && application.status === 'FULL_BOARD_MEETING') {
    actionPanel = <CompleteMeetingForm applicationId={application.id} />;
  } else if (role === 'CHAIRMAN' && FINAL_DECISION_STATUSES.includes(application.status)) {
    actionPanel = <FinalDecisionForm applicationId={application.id} />;
  } else if (
    role === 'REVIEWER' &&
    EXPEDITED_VOTING_STATUSES.includes(application.status) &&
    myAssignment?.vote === 'PENDING'
  ) {
    actionPanel = <VoteForm applicationId={application.id} />;
  } else if (role === 'RESEARCHER' && application.status === 'REVISION_REQUIRED') {
    actionPanel = <ResubmitRevisionForm applicationId={application.id} round={application.revisionRound} />;
  }

  return (
    <PageShell title={`${application.applicationNumber} - ${application.title}`}>
      <div className="card">
        <h2>Informasi Aplikasi</h2>
        <dl className="detail-grid">
          <dt>Status</dt>
          <dd>
            <StatusBadge status={application.status} />
          </dd>
          <dt>Panel</dt>
          <dd>{application.panelType ? PANEL_TYPE_LABELS[application.panelType] : '-'}</dd>
          <dt>Jalur</dt>
          <dd>{application.track ? TRACK_LABELS[application.track] : '-'}</dd>
          <dt>Peneliti</dt>
          <dd>{application.researcher.name}</dd>
          <dt>Institusi</dt>
          <dd>{application.institution ?? application.researcher.institution ?? '-'}</dd>
          <dt>Jenis Penelitian</dt>
          <dd>{application.researchType ?? '-'}</dd>
          <dt>Tanggal Pengajuan</dt>
          <dd>{application.submittedAt.toLocaleDateString('id-ID')}</dd>
          <dt>Batas Waktu Saat Ini</dt>
          <dd>{deadlineInfo && <DeadlineBadge deadline={deadlineInfo.deadline} label={deadlineInfo.label} />}</dd>
          <dt>Revisi</dt>
          <dd>{application.revisionRound || '-'}</dd>
        </dl>
      </div>

      {application.panelType && (
        <div className="card">
          <h2>
            Kelengkapan {application.panelType === 'SAINTEK' ? 'Panel Sains dan Teknologi' : 'Panel Sosial dan Humaniora'}
          </h2>
          <dl className="detail-grid">
            <dt>Nama Pengusul/Ketua Peneliti/Kegiatan Ilmiah</dt>
            <dd>{application.proposerName ?? '-'}</dd>
          </dl>
          <ul>
            {application.saintekFormUrl && (
              <li>
                <a href={application.saintekFormUrl} target="_blank" rel="noreferrer">
                  Formulir Aplikasi Saintek (Word)
                </a>
              </li>
            )}
            {application.soshumFormUrl && (
              <li>
                <a href={application.soshumFormUrl} target="_blank" rel="noreferrer">
                  Formulir Aplikasi Telaah Etik (Word)
                </a>
              </li>
            )}
            {application.proposalUrl && (
              <li>
                <a href={application.proposalUrl} target="_blank" rel="noreferrer">
                  Proposal Penelitian (Pdf)
                </a>
              </li>
            )}
            {application.leaderStatementUrl && (
              <li>
                <a href={application.leaderStatementUrl} target="_blank" rel="noreferrer">
                  Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah (Pdf)
                </a>
              </li>
            )}
            {application.conflictOfInterestUrl && (
              <li>
                <a href={application.conflictOfInterestUrl} target="_blank" rel="noreferrer">
                  Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah terkait Konflik Kepentingan (Pdf)
                </a>
              </li>
            )}
            {application.informedConsentUrl && (
              <li>
                <a href={application.informedConsentUrl} target="_blank" rel="noreferrer">
                  Lembar Informed Consent (Pdf)
                </a>
              </li>
            )}
            {application.researchInstrumentUrl && (
              <li>
                <a href={application.researchInstrumentUrl} target="_blank" rel="noreferrer">
                  Instrumen Penelitian
                </a>
              </li>
            )}
            {application.supportingDocumentUrl && (
              <li>
                <a href={application.supportingDocumentUrl} target="_blank" rel="noreferrer">
                  Dokumen Pendukung (Pdf)
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {actionPanel}

      {application.reviewAssignments.length > 0 && (
        <div className="card">
          <h2>Tim Penelaah</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Suara</th>
                <th>Komentar</th>
              </tr>
            </thead>
            <tbody>
              {application.reviewAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.reviewer.name}</td>
                  <td>{VOTE_LABELS[assignment.vote]}</td>
                  <td>{assignment.comments ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {application.plenaryMeeting && (
        <div className="card">
          <h2>Rapat Pleno</h2>
          <p>
            {application.plenaryMeeting.scheduledAt.toLocaleString('id-ID')}
            {application.plenaryMeeting.location ? ` - ${application.plenaryMeeting.location}` : ''}
          </p>
          <ul>
            {application.plenaryMeeting.participants.map((participant) => (
              <li key={participant.id}>
                {participant.isExternal
                  ? `${participant.externalName} (${participant.externalInstitution ?? 'Eksternal'})`
                  : participant.user?.name}
              </li>
            ))}
          </ul>
          {application.plenaryMeeting.minutesNotes && <p>{application.plenaryMeeting.minutesNotes}</p>}
        </div>
      )}

      <div className="card">
        <h2>Dokumen</h2>
        <DocumentsList documents={application.documents} deletable={canManageDocuments} />
      </div>

      {canManageDocuments && <AddDocumentForm applicationId={application.id} />}

      <div className="card">
        <h2>Riwayat Status</h2>
        <StatusTimeline entries={application.statusHistory} />
      </div>
    </PageShell>
  );
}
