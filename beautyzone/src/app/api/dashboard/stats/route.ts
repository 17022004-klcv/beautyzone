import { NextResponse } from "next/server";
import { getDashboardStats } from "@/src/app/services/dashboard.service";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error en API GET /api/dashboard/stats:", error);
    return NextResponse.json(
      { error: "Error al obtener las estadísticas" },
      { status: 500 },
    );
  }
}
