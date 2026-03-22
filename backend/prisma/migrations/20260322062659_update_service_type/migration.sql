/*
  Warnings:

  - The values [SALES_CONSULTATION,DETAILED_CONSULTATION,REPAIR_MAINTENANCE] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('NEW_CAR_CONSULTATION', 'VEHICLE_REPAIR', 'VEHICLE_MAINTENANCE');
ALTER TABLE "public"."dealerships" ALTER COLUMN "supported_services" DROP DEFAULT;
ALTER TABLE "dealerships" ALTER COLUMN "supported_services" TYPE "ServiceType_new"[] USING ("supported_services"::text::"ServiceType_new"[]);
ALTER TABLE "appointments" ALTER COLUMN "service_type" TYPE "ServiceType_new" USING ("service_type"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "public"."ServiceType_old";
ALTER TABLE "dealerships" ALTER COLUMN "supported_services" SET DEFAULT ARRAY['NEW_CAR_CONSULTATION', 'VEHICLE_REPAIR', 'VEHICLE_MAINTENANCE']::"ServiceType"[];
COMMIT;
