/*
  Warnings:

  - A unique constraint covering the columns `[pinCaja]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "pinCaja" VARCHAR(6);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_pinCaja_key" ON "usuarios"("pinCaja");
