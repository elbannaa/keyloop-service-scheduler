/*
  Warnings:

  - You are about to drop the column `customer_phone` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `dealerships` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `technicians` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "customer_phone";

-- AlterTable
ALTER TABLE "dealerships" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "technicians" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phone";
