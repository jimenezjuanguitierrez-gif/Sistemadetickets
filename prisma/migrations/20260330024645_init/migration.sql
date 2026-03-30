/*
  Warnings:

  - Added the required column `nombre` to the `Computadora` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'PROFESOR';

-- AlterTable
ALTER TABLE "Computadora" ADD COLUMN     "disco" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "descripcionDanio" TEXT NOT NULL DEFAULT '';
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'ok',
ADD COLUMN     "lab" TEXT NOT NULL DEFAULT 'otros',
ADD COLUMN     "marca" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "modelo" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "os" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "procesador" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ram" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "ubicacion" SET DEFAULT '',
ALTER COLUMN "descripcion" SET DEFAULT '';
