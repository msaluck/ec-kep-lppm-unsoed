-- AlterTable
ALTER TABLE `applications` ADD COLUMN `conflictOfInterestUrl` TEXT NULL,
    ADD COLUMN `institution` VARCHAR(191) NULL,
    ADD COLUMN `leaderStatementUrl` TEXT NULL,
    ADD COLUMN `panelType` ENUM('SAINTEK', 'SOSHUM') NULL,
    ADD COLUMN `proposalUrl` TEXT NULL,
    ADD COLUMN `proposerName` VARCHAR(191) NULL,
    ADD COLUMN `saintekFormUrl` TEXT NULL,
    ADD COLUMN `supportingDocumentUrl` TEXT NULL;
