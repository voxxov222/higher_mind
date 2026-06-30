-- DropForeignKey
ALTER TABLE "AdminAuditLog" DROP CONSTRAINT "AdminAuditLog_adminId_fkey";

-- AlterTable
ALTER TABLE "AdminAuditLog" ALTER COLUMN "adminId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_subscriptionPlan_idx" ON "User"("subscriptionPlan");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
