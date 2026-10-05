-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Church_slug_key" ON "Church"("slug");

-- Igreja padrão: recebe todos os dados existentes (instalação era single-tenant).
INSERT INTO "Church" ("id", "name", "slug", "active", "createdAt", "updatedAt")
VALUES ('church-move-santana', 'Move Santana', 'move-santana', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "churchId" TEXT;
ALTER TABLE "Event" ADD COLUMN "churchId" TEXT;
ALTER TABLE "InviteLink" ADD COLUMN "churchId" TEXT;

-- Backfill
UPDATE "User" SET "churchId" = 'church-move-santana';
UPDATE "Event" SET "churchId" = 'church-move-santana';
UPDATE "InviteLink" SET "churchId" = 'church-move-santana';

ALTER TABLE "Event" ALTER COLUMN "churchId" SET NOT NULL;
ALTER TABLE "InviteLink" ALTER COLUMN "churchId" SET NOT NULL;

-- DropIndex
DROP INDEX "Event_active_date_idx";
DROP INDEX "InviteLink_active_expiresAt_idx";

-- CreateIndex
CREATE INDEX "User_churchId_idx" ON "User"("churchId");
CREATE INDEX "Event_churchId_active_date_idx" ON "Event"("churchId", "active", "date");
CREATE INDEX "InviteLink_churchId_active_expiresAt_idx" ON "InviteLink"("churchId", "active", "expiresAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
