-- CreateTable
CREATE TABLE "backup_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "frecuencia" TEXT NOT NULL DEFAULT 'DIARIO',
    "diaSemana" INTEGER NOT NULL DEFAULT 1,
    "diaMes" INTEGER NOT NULL DEFAULT 1,
    "hora" INTEGER NOT NULL DEFAULT 2,
    "minuto" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_ejecutado" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" SERIAL NOT NULL,
    "archivo" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "tamano_bytes" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "mensaje" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'MANUAL',
    "iniciado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backups_creado_en_idx" ON "backups"("creado_en");
