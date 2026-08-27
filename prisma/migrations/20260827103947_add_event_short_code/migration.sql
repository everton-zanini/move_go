-- AlterTable
ALTER TABLE "Event" ADD COLUMN "shortCode" TEXT;

-- Backfill: eventos existentes ganham um código curto gerado (nunca escolhido pelo admin).
UPDATE "Event" SET "shortCode" = upper(substr(md5(random()::text || id), 1, 6)) WHERE "shortCode" IS NULL;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "shortCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_shortCode_key" ON "Event"("shortCode");
