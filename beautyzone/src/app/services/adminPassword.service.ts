const BASE = "/api/admin/verificar-password";

/**
 * Verifica la contraseña de administrador contra el servidor.
 *
 * La app no tiene sesión: el login solo escribe en localStorage. Por eso esta
 * comprobación se usa como barrera en la interfaz, pero las rutas que escriben
 * vuelven a validarla; no hay que confiar en este resultado por sí solo.
 */
export async function verificarPasswordAdmin(
  password: string,
): Promise<{ ok: true; admin: { id: number; nombre: string } }> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });

  const datos = (await res.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!res.ok) {
    throw new Error(
      datos?.error ?? "No se pudo verificar la contraseña de administrador.",
    );
  }

  return datos as { ok: true; admin: { id: number; nombre: string } };
}

/** ¿Hay alguna contraseña de administrador configurada? */
export async function hayPasswordAdmin(): Promise<boolean> {
  const res = await fetch(BASE, { cache: "no-store" });
  const datos = (await res.json().catch(() => null)) as {
    configurada?: boolean;
  } | null;
  return datos?.configurada === true;
}
