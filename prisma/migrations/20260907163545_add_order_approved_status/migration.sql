/*
  Warnings:

  - You are about to drop the column `employee_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'APPROVED';

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_fkey";

-- DropIndex
DROP INDEX "projects_order_id_key";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "employee_id";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "PaymentStatus";
