-- AlterTable
ALTER TABLE "ventas" ADD COLUMN     "idcaja_turno" INTEGER;

-- CreateTable
CREATE TABLE "caja_turnos" (
    "id" SERIAL NOT NULL,
    "idcajero" INTEGER NOT NULL,
    "nombre_caja" TEXT NOT NULL DEFAULT 'Caja Principal',
    "password_pin" TEXT NOT NULL,
    "monto_apertura" DECIMAL(10,2) NOT NULL,
    "monto_cierre_esperado" DECIMAL(10,2),
    "monto_cierre_real" DECIMAL(10,2),
    "diferencia" DECIMAL(10,2),
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMP(3),

    CONSTRAINT "caja_turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arqueo_denominaciones" (
    "id" SERIAL NOT NULL,
    "idcaja_turno" INTEGER NOT NULL,
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
    "total_tarjeta" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_transferencia" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_efectivo_contado" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arqueo_denominaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "arqueo_denominaciones_idcaja_turno_key" ON "arqueo_denominaciones"("idcaja_turno");

-- AddForeignKey
ALTER TABLE "caja_turnos" ADD CONSTRAINT "caja_turnos_idcajero_fkey" FOREIGN KEY ("idcajero") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_idcaja_turno_fkey" FOREIGN KEY ("idcaja_turno") REFERENCES "caja_turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arqueo_denominaciones" ADD CONSTRAINT "arqueo_denominaciones_idcaja_turno_fkey" FOREIGN KEY ("idcaja_turno") REFERENCES "caja_turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
