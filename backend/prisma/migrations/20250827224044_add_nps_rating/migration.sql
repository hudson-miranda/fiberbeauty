-- CreateEnum
CREATE TYPE "NPSCategory" AS ENUM ('DETRACTOR', 'NEUTRAL', 'PROMOTER');

-- CreateTable
CREATE TABLE "nps_ratings" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "category" "NPSCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "nps_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nps_ratings_attendanceId_key" ON "nps_ratings"("attendanceId");

-- AddForeignKey
ALTER TABLE "nps_ratings" ADD CONSTRAINT "nps_ratings_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_ratings" ADD CONSTRAINT "nps_ratings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
