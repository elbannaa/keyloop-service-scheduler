-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED';
