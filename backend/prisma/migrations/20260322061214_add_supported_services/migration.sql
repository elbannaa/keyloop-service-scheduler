/*
  Warnings:

  - The values [SALES_CONSULTATION,DETAILED_CONSULTATION,REPAIR_MAINTENANCE] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "ServiceType" ADD VALUE 'NEW_CAR_CONSULTATION';
ALTER TYPE "ServiceType" ADD VALUE 'VEHICLE_REPAIR';
ALTER TYPE "ServiceType" ADD VALUE 'VEHICLE_MAINTENANCE';
COMMIT;

-- AlterTable
ALTER TABLE "dealerships" ADD COLUMN     "supported_services" "ServiceType"[] DEFAULT ARRAY['NEW_CAR_CONSULTATION', 'VEHICLE_REPAIR', 'VEHICLE_MAINTENANCE']::"ServiceType"[];
