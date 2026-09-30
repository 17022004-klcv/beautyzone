-- CreateTable
CREATE TABLE "bitacora" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT,
    "descripcion" TEXT NOT NULL,
    "datos" JSONB,
    "metodo" TEXT,
    "ruta" TEXT,
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(400),
    "resultado" TEXT NOT NULL DEFAULT 'EXITO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bitacora_created_at_idx" ON "bitacora"("created_at");

-- CreateIndex
CREATE INDEX "bitacora_id_usuario_idx" ON "bitacora"("id_usuario");

-- CreateIndex
CREATE INDEX "bitacora_accion_entidad_idx" ON "bitacora"("accion", "entidad");

-- CreateIndex
CREATE INDEX "bitacora_entidad_entidad_id_idx" ON "bitacora"("entidad", "entidad_id");

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
