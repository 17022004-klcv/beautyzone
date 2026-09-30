-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "tipo_comision" TEXT NOT NULL DEFAULT 'PORCENTAJE',
ALTER COLUMN "porcentaje_comision" SET DATA TYPE DECIMAL(10,2);
