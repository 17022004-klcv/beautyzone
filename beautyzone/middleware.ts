import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Obtén el token o sesión del usuario (ejemplo leyendo la cookie o header)
  const userRole = request.cookies.get("user_role")?.value; // 'ADMIN' o 'CLIENTE'
  const currentPath = request.nextUrl.pathname;

  // 2. Si el usuario es ADMIN y está intentando acceder al sitio público/cliente (ej. /reservas)
  if (userRole === "ADMIN" && !currentPath.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // 3. Si un CLIENTE normal intenta entrar al panel de administración
  if (userRole !== "ADMIN" && currentPath.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/reservas", request.url));
  }

  return NextResponse.next();
}

// Rutas donde se ejecutará el middleware
export const config = {
  matcher: ["/reservas/:path*", "/admin/:path*"],
};
