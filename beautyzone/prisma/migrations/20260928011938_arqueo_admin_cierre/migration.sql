-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "password_admin" VARCHAR(100);

-- CreateTable
CREATE TABLE "cierres_administrativos" (
    "id" SERIAL NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "total_cajas" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_gastos" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_esperado" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "monto_real" DECIMAL(10,2),
    "diferencia" DECIMAL(10,2),
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cierres_administrativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_cierre" (
    "id" SERIAL NOT NULL,
    "id_cierre_admin" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "numero_comprobante" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_cierre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denominaciones_cierre_admin" (
    "id" SERIAL NOT NULL,
    "id_cierre_admin" INTEGER NOT NULL,
    "b100" INTEGER NOT NULL DEFAULT 0,
    "b50" INTEGER NOT NULL DEFAULT 0,
    "b20" INTEGER NOT NULL DEFAULT 0,
    "b10" INTEGER NOT NULL DEFAULT 0,
    "b5" INTEGER NOT NULL DEFAULT 0,
    "b1" INTEGER NOT NULL DEFAULT 0,
    "m100" INTEGER NOT NULL DEFAULT 0,
    "m025" INTEGER NOT NULL DEFAULT 0,
    "m010" INTEGER NOT NULL DEFAULT 0,
    "m005" INTEGER NOT NULL DEFAULT 0,
    "m001" INTEGER NOT NULL DEFAULT 0,
    "total_contado" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "denominaciones_cierre_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cierres_administrativos_fecha_key" ON "cierres_administrativos"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "denominaciones_cierre_admin_id_cierre_admin_key" ON "denominaciones_cierre_admin"("id_cierre_admin");

-- AddForeignKey
ALTER TABLE "cierres_administrativos" ADD CONSTRAINT "cierres_administrativos_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_cierre" ADD CONSTRAINT "gastos_cierre_id_cierre_admin_fkey" FOREIGN KEY ("id_cierre_admin") REFERENCES "cierres_administrativos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denominaciones_cierre_admin" ADD CONSTRAINT "denominaciones_cierre_admin_id_cierre_admin_fkey" FOREIGN KEY ("id_cierre_admin") REFERENCES "cierres_administrativos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
