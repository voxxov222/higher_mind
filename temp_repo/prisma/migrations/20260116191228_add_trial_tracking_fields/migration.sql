-- AlterTable
ALTER TABLE "User" ADD COLUMN     "existingUserTrialActivatedAt" TIMESTAMP(3),
ADD COLUMN     "trialWelcomeShownAt" TIMESTAMP(3);
