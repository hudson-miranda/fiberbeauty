-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'IN_PROGRESS';
