import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { id: 1, nombre: "Admin" },
    { id: 2, nombre: "Cliente" },
    { id: 3, nombre: "Estilista" },
    { id: 4, nombre: "Recepcionista" },
  ];

  console.log("Iniciando la siembra de datos (Seed)...");

  for (const rol of roles) {
    const rolCreado = await prisma.role.upsert({
      where: { id: rol.id },
      update: { nombre: rol.nombre },
      create: {
        id: rol.id,
        nombre: rol.nombre,
      },
    });
    console.log(
      `Rol verificado/creado: ${rolCreado.nombre} (ID: ${rolCreado.id})`,
    );
  }

  console.log("Proceso de Seed finalizado con éxito.");
}

main()
  .catch((e) => {
    console.error("Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
