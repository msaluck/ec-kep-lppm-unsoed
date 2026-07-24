-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('RESEARCHER', 'SECRETARIAT', 'CHAIRMAN', 'REVIEWER', 'ADMIN') NOT NULL,
    `institution` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` VARCHAR(191) NOT NULL,
    `applicationNumber` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `researchType` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'SECRETARIAT_REVIEW', 'RETURNED_INCOMPLETE', 'FORWARDED_TO_CHAIRMAN', 'CHAIRMAN_CLASSIFYING', 'EXEMPTED_PROCESSING', 'EXPEDITED_ASSIGNED', 'EXPEDITED_REVIEWING', 'FULL_BOARD_SCHEDULING', 'FULL_BOARD_MEETING', 'PENDING_FINAL_DECISION', 'APPROVED', 'REVISION_REQUIRED', 'REJECTED', 'REVISION_1_SUBMITTED', 'REVISION_2_SUBMITTED', 'CLOSED') NOT NULL DEFAULT 'SUBMITTED',
    `track` ENUM('EXEMPTED', 'EXPEDITED', 'FULL_BOARD') NULL,
    `revisionRound` INTEGER NOT NULL DEFAULT 0,
    `researcherId` VARCHAR(191) NOT NULL,
    `secretariatCheckedById` VARCHAR(191) NULL,
    `secretariatDeadline` DATETIME(3) NULL,
    `secretariatCheckedAt` DATETIME(3) NULL,
    `chairmanId` VARCHAR(191) NULL,
    `classificationDeadline` DATETIME(3) NULL,
    `classifiedAt` DATETIME(3) NULL,
    `reviewDeadline` DATETIME(3) NULL,
    `finalDecisionDeadline` DATETIME(3) NULL,
    `decisionType` ENUM('APPROVED', 'REVISION_NEEDED', 'REJECTED') NULL,
    `decisionNotes` TEXT NULL,
    `decidedAt` DATETIME(3) NULL,
    `resubmissionDeadline` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `applications_applicationNumber_key`(`applicationNumber`),
    INDEX `applications_status_idx`(`status`),
    INDEX `applications_researcherId_idx`(`researcherId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('DRAFT', 'SUBMITTED', 'SECRETARIAT_REVIEW', 'RETURNED_INCOMPLETE', 'FORWARDED_TO_CHAIRMAN', 'CHAIRMAN_CLASSIFYING', 'EXEMPTED_PROCESSING', 'EXPEDITED_ASSIGNED', 'EXPEDITED_REVIEWING', 'FULL_BOARD_SCHEDULING', 'FULL_BOARD_MEETING', 'PENDING_FINAL_DECISION', 'APPROVED', 'REVISION_REQUIRED', 'REJECTED', 'REVISION_1_SUBMITTED', 'REVISION_2_SUBMITTED', 'CLOSED') NULL,
    `toStatus` ENUM('DRAFT', 'SUBMITTED', 'SECRETARIAT_REVIEW', 'RETURNED_INCOMPLETE', 'FORWARDED_TO_CHAIRMAN', 'CHAIRMAN_CLASSIFYING', 'EXEMPTED_PROCESSING', 'EXPEDITED_ASSIGNED', 'EXPEDITED_REVIEWING', 'FULL_BOARD_SCHEDULING', 'FULL_BOARD_MEETING', 'PENDING_FINAL_DECISION', 'APPROVED', 'REVISION_REQUIRED', 'REJECTED', 'REVISION_1_SUBMITTED', 'REVISION_2_SUBMITTED', 'CLOSED') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `deadlineAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `application_status_history_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `documentType` ENUM('RESEARCH_PROTOCOL', 'INFORMED_CONSENT', 'CV_RESEARCHER', 'SUPPORTING_DOCUMENT', 'EXEMPTION_LETTER', 'ETHICAL_CLEARANCE_LETTER', 'REVISION_RESPONSE', 'MEETING_MINUTES', 'OTHER') NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `revisionRound` INTEGER NOT NULL DEFAULT 0,
    `uploadedById` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `documents_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deadline` DATETIME(3) NULL,
    `vote` ENUM('PENDING', 'AGREE', 'DISAGREE') NOT NULL DEFAULT 'PENDING',
    `comments` TEXT NULL,
    `votedAt` DATETIME(3) NULL,

    UNIQUE INDEX `review_assignments_applicationId_reviewerId_key`(`applicationId`, `reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plenary_meetings` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NULL,
    `minutesNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `plenary_meetings_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_participants` (
    `id` VARCHAR(191) NOT NULL,
    `meetingId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `externalName` VARCHAR(191) NULL,
    `externalInstitution` VARCHAR(191) NULL,
    `externalEmail` VARCHAR(191) NULL,
    `isExternal` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `recipientEmail` VARCHAR(191) NOT NULL,
    `event` ENUM('APPLICATION_SUBMITTED', 'RETURNED_INCOMPLETE', 'FORWARDED_TO_CHAIRMAN', 'CLASSIFIED', 'REVIEWER_ASSIGNED', 'REVIEW_VOTE_SUBMITTED', 'REVIEW_COMPLETED', 'PLENARY_SCHEDULED', 'FINAL_DECISION_APPROVED', 'FINAL_DECISION_REVISION', 'FINAL_DECISION_REJECTED', 'DEADLINE_REMINDER', 'REVISION_SUBMITTED') NOT NULL,
    `channel` VARCHAR(191) NOT NULL DEFAULT 'EMAIL',
    `subject` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `resendMessageId` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_logs_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_researcherId_fkey` FOREIGN KEY (`researcherId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_secretariatCheckedById_fkey` FOREIGN KEY (`secretariatCheckedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_chairmanId_fkey` FOREIGN KEY (`chairmanId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_status_history` ADD CONSTRAINT `application_status_history_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_status_history` ADD CONSTRAINT `application_status_history_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plenary_meetings` ADD CONSTRAINT `plenary_meetings_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_participants` ADD CONSTRAINT `meeting_participants_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `plenary_meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_participants` ADD CONSTRAINT `meeting_participants_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
