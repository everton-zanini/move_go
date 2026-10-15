-- CreateTable
CREATE TABLE "DevotionalJourney" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalDays" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "bonusXp" INTEGER NOT NULL DEFAULT 100,
    "rewardItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevotionalJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevotionalDay" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "bibleVerse" TEXT,
    "content" TEXT NOT NULL,
    "taskPrompt" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 20,
    "happinessReward" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevotionalDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevotionalCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "devotionalDayId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "earnedXp" INTEGER NOT NULL DEFAULT 0,
    "userNote" TEXT,

    CONSTRAINT "DevotionalCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DevotionalJourney_churchId_active_idx" ON "DevotionalJourney"("churchId", "active");

-- CreateIndex
CREATE INDEX "DevotionalDay_journeyId_idx" ON "DevotionalDay"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "DevotionalDay_journeyId_dayNumber_key" ON "DevotionalDay"("journeyId", "dayNumber");

-- CreateIndex
CREATE INDEX "DevotionalCheckIn_userId_idx" ON "DevotionalCheckIn"("userId");

-- CreateIndex
CREATE INDEX "DevotionalCheckIn_devotionalDayId_idx" ON "DevotionalCheckIn"("devotionalDayId");

-- CreateIndex
CREATE UNIQUE INDEX "DevotionalCheckIn_userId_devotionalDayId_key" ON "DevotionalCheckIn"("userId", "devotionalDayId");

-- AddForeignKey
ALTER TABLE "DevotionalJourney" ADD CONSTRAINT "DevotionalJourney_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevotionalJourney" ADD CONSTRAINT "DevotionalJourney_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevotionalDay" ADD CONSTRAINT "DevotionalDay_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "DevotionalJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevotionalCheckIn" ADD CONSTRAINT "DevotionalCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevotionalCheckIn" ADD CONSTRAINT "DevotionalCheckIn_devotionalDayId_fkey" FOREIGN KEY ("devotionalDayId") REFERENCES "DevotionalDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
