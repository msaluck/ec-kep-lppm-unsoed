'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';

const ParticipantInput = z
  .object({
    userId: z.string().min(1).optional(),
    externalName: z.string().min(1).optional(),
    externalInstitution: z.string().max(255).optional(),
    externalEmail: z.string().email().optional(),
  })
  .refine((p) => Boolean(p.userId) || Boolean(p.externalName), {
    message: 'Each participant needs either a userId (internal) or an externalName (external).',
  });

const SchedulePlenaryMeetingInput = z.object({
  applicationId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  location: z.string().max(500).optional(),
  participants: z.array(ParticipantInput).min(1),
});

type SchedulePlenaryMeetingResult = { success: true; meetingId: string } | { success: false; error: string };

// Milestone 3c (Full Board track) — schedules the plenary meeting with
// internal committee members and external members, and moves the
// application into FULL_BOARD_MEETING. The Milestone 4 review deadline
// (max 10 working days) was already set when the Chairman classified the
// application as Full Board; this step does not restart that clock.
export async function schedulePlenaryMeeting(
  input: z.infer<typeof SchedulePlenaryMeetingInput>,
): Promise<SchedulePlenaryMeetingResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || (sessionUser.role !== 'SECRETARIAT' && sessionUser.role !== 'CHAIRMAN')) {
    return { success: false, error: 'Unauthorized: only the Secretariat or Chairman may schedule the plenary meeting.' };
  }

  const parsed = SchedulePlenaryMeetingInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { applicationId, scheduledAt, location, participants } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { researcher: true },
  });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (application.track !== 'FULL_BOARD' || application.status !== 'FULL_BOARD_SCHEDULING') {
    return {
      success: false,
      error: `Application is not awaiting plenary scheduling (current status: ${application.status}).`,
    };
  }

  const internalIds = participants.map((p) => p.userId).filter((id): id is string => Boolean(id));
  const internalUsers = internalIds.length
    ? await prisma.user.findMany({ where: { id: { in: internalIds } }, select: { id: true, name: true, email: true } })
    : [];
  if (internalUsers.length !== internalIds.length) {
    return { success: false, error: 'One or more internal participants were not found.' };
  }

  const meeting = await prisma.$transaction(async (tx) => {
    const created = await tx.plenaryMeeting.create({
      data: {
        applicationId,
        scheduledAt,
        location,
        participants: {
          create: participants.map((p) =>
            p.userId
              ? { userId: p.userId, isExternal: false }
              : {
                  externalName: p.externalName,
                  externalInstitution: p.externalInstitution,
                  externalEmail: p.externalEmail,
                  isExternal: true,
                },
          ),
        },
      },
    });

    await tx.application.update({
      where: { id: applicationId },
      data: { status: 'FULL_BOARD_MEETING' },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: 'FULL_BOARD_SCHEDULING',
        toStatus: 'FULL_BOARD_MEETING',
        actorId: sessionUser.id,
        notes: location ? `Rapat Pleno dijadwalkan di ${location}.` : 'Rapat Pleno dijadwalkan.',
      },
    });

    return created;
  });

  const scheduledDateLabel = scheduledAt.toLocaleString('id-ID');

  await sendAndLogNotification({
    applicationId,
    userId: application.researcherId,
    event: 'PLENARY_SCHEDULED',
    to: application.researcher.email,
    subject: `Jadwal Rapat Pleno - ${application.applicationNumber}`,
    text: `Rapat Pleno untuk aplikasi ${application.applicationNumber} ("${application.title}") dijadwalkan pada ${scheduledDateLabel}${location ? ` di ${location}` : ''}. Mohon kesediaan untuk hadir memberikan klarifikasi.`,
  });

  await Promise.all(
    internalUsers.map((user) =>
      sendAndLogNotification({
        applicationId,
        userId: user.id,
        event: 'PLENARY_SCHEDULED',
        to: user.email,
        subject: `Undangan Rapat Pleno - ${application.applicationNumber}`,
        text: `Anda diundang sebagai anggota Rapat Pleno untuk aplikasi ${application.applicationNumber} ("${application.title}") pada ${scheduledDateLabel}${location ? ` di ${location}` : ''}.`,
      }),
    ),
  );

  // External members without a system account still get an email if one
  // was provided; NotificationLog.userId is nullable for exactly this case.
  const externalWithEmail = participants.filter((p) => !p.userId && p.externalEmail);
  await Promise.all(
    externalWithEmail.map((p) =>
      sendAndLogNotification({
        applicationId,
        userId: null,
        event: 'PLENARY_SCHEDULED',
        to: p.externalEmail as string,
        subject: `Undangan Rapat Pleno - ${application.applicationNumber}`,
        text: `Anda diundang sebagai anggota eksternal Rapat Pleno untuk aplikasi ${application.applicationNumber} pada ${scheduledDateLabel}${location ? ` di ${location}` : ''}.`,
      }),
    ),
  );

  revalidatePath(`/applications/${applicationId}`);
  return { success: true, meetingId: meeting.id };
}
