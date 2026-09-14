import { NextResponse } from "next/server";
import { getCitasPorFecha } from "@/src/app/services/agenda.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const date = dateParam ? dateParam : new Date().toISOString().split("T")[0];
  const citas = await getCitasPorFecha(date);

  return NextResponse.json(citas);
}
