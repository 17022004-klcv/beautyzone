"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Utensils,
  Sun,
  LogOut,
  UserCheck,
  Camera,
  CameraOff,
  Keyboard,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import Button from "@/src/components/ui/Button";
import SearchableSelect from "@/src/components/ui/SearchableSelect";

import {
  TipoRegistro,
  RegistrarAsistenciaDTO,
} from "@/src/app/types/asistencia";
import { UsuarioItem } from "@/src/app/types/usuario";
import { AsistenciaService } from "@/src/app/services/asistencia.service";

const OPCIONES_MARCACION: {
  tipo: TipoRegistro;
  label: string;
  icon: any;
  color: string;
  border: string;
}[] = [
  {
    tipo: "ENTRADA",
    label: "Entrada Jornada",
    icon: LogIn,
    color: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
    border: "border-emerald-500/30",
  },
  {
    tipo: "SALIDA_ALMUERZO",
    label: "Salida a Almuerzo",
    icon: Utensils,
    color: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
    border: "border-amber-500/30",
  },
  {
    tipo: "ENTRADA_ALMUERZO",
    label: "Regreso de Almuerzo",
    icon: Sun,
    color: "bg-sky-500/10 text-sky-700 hover:bg-sky-500/20",
    border: "border-sky-500/30",
  },
  {
    tipo: "SALIDA",
    label: "Salida Jornada",
    icon: LogOut,
    color: "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20",
    border: "border-rose-500/30",
  },
];
const VIDEO_FONDO = "/video/fondo.mp4";
export default function KioscoMarcajeView() {
  const [empleados, setEmpleados] = useState<UsuarioItem[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState<UsuarioItem | null>(
    null,
  );
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>("ENTRADA");
  const [loading, setLoading] = useState(false);
  const [modoManual, setModoManual] = useState(false);

  // Estado del Escáner
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const empleadosRef = useRef<UsuarioItem[]>([]);

  // Reloj en tiempo real
  const [time, setTime] = useState<Date | null>(null);

  // Mensajes de Feedback
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 1. Reloj en tiempo real
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Cargar Empleados (Solo una vez)
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const res = await fetch("/api/usuarios");
        if (res.ok) {
          const data: UsuarioItem[] = await res.json();
          const activos = data.filter((u) => u.estado);
          setEmpleados(activos);
          empleadosRef.current = activos; // Guardar en el Ref para lectura rápida en QR
          console.log("Lista de empleados cargados:", activos);
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      }
    };
    fetchEmpleados();
  }, []);

  // 3. Funciones de inicio y detención de la cámara
  const startCamera = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }

      const qrScanner = html5QrCodeRef.current;
      const state = qrScanner.getState();

      if (
        state === Html5QrcodeScannerState.NOT_STARTED ||
        state === Html5QrcodeScannerState.UNKNOWN
      ) {
        await qrScanner.start(
          { facingMode: "user" },
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(minEdge * 0.8),
                height: Math.floor(minEdge * 0.8),
              };
            },
          },
          (decodedText) => {
            handleGafeteEscaneado(decodedText);
          },
          () => {},
        );
        setIsCameraActive(true);
      }
    } catch (err: any) {
      if (!err?.toString().includes("already under transition")) {
        console.error("Error al acceder a la cámara:", err);
      }
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error al detener la cámara:", err);
      } finally {
        html5QrCodeRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  // 4. Encender / Apagar cámara según el modo activo
  useEffect(() => {
    let active = true;

    if (!modoManual) {
      // Retardo de 300ms para asegurar que el <div id="reader"> ya esté montado en el DOM
      const timer = setTimeout(() => {
        if (active) startCamera();
      }, 300);

      return () => {
        active = false;
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [modoManual]);

  // 5. Manejar lectura del QR/Gafete
  const handleGafeteEscaneado = (rawCode: string) => {
    if (isProcessing) return;

    const codigo = rawCode.trim();
    console.log("Código leído:", codigo);

    const idEscaneado = parseInt(codigo, 10);

    // Buscar en el Ref (evita cierres obsoletos en React)
    const emp = empleadosRef.current.find((e) => e.id === idEscaneado);

    if (emp) {
      setIsProcessing(true);
      setSelectedEmpleado(emp);
      setStatusMessage({
        type: "success",
        text: `Gafete detectado: ${emp.nombre} ${emp.apellido}`,
      });

      setTimeout(() => setIsProcessing(false), 3000);
    } else {
      setIsProcessing(true);
      setStatusMessage({
        type: "error",
        text: `Empleado con ID "${codigo}" no encontrado.`,
      });

      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  // Procesar Registro de Marca
  const handleMarcaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpleado) {
      setStatusMessage({
        type: "error",
        text: "Por favor escanea un gafete o selecciona un empleado.",
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora = ahora.toTimeString().split(" ")[0].substring(0, 5);

    const payload: RegistrarAsistenciaDTO = {
      idempleado: selectedEmpleado.id,
      tipoRegistro,
      fecha,
      hora,
    };

    try {
      await AsistenciaService.registrarAsistencia(payload);
      setStatusMessage({
        type: "success",
        text: `¡Marca registrada con éxito para ${selectedEmpleado.nombre}!`,
      });

      // Limpiar selección tras 3.5 segundos
      setTimeout(() => {
        setSelectedEmpleado(null);
        setStatusMessage(null);
        setIsProcessing(false); // <--- Liberar el procesador de QR aquí
      }, 3500);
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.message || "Error al procesar la marcación.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover object-top -z-20"
      >
        <source src="/video/fondo.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-[#32130E]/30 -z-10" />
      <div
        className="fixed inset-0 bg-white/1
      0 backdrop-blur-[1px] -z-10"
      />

      <Link
        href="/login"
        className="absolute top-4 right-4 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-white/30 backdrop-blur-xl hover:bg-white/60 text-white border border-white/40 shadow-[0_8px_25px_rgba(50,19,14,0.15)] transition-all duration-300 hover:scale-105"
        title="Salir al Login"
      >
        <LogOut className="w-4 h-4" />
      </Link>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-5">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-mono font-extrabold text-white tracking-tight drop-shadow-[0_3px_10px_rgba(50,19,14,0.5)]">
              {time ? time.toLocaleTimeString("es-SV") : "--:--:--"}
            </h1>
            <p className="text-xs md:text-sm font-semibold text-white/90 capitalize drop-shadow-[0_2px_5px_rgba(50,19,14,0.4)]">
              {time
                ? time.toLocaleDateString("es-SV", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-3 bg-orange-900/5 backdrop-blur-2xl border border-white/40 rounded-3xl p-4 shadow-[0_20px_60px_rgba(50,19,14,0.18)] transition-all duration-300">
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-white/30">
                <Clock className="w-4 h-4 text-white" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  Horarios
                </h2>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl  bg-white/20 border border-emerald-200/20 backdrop-blur-md text-black/60">
                  <div className="flex items-center gap-2">
                    <LogIn className="w-3.5 h-3.5 text-black-200" />
                    <span className="text-[10px] font-bold">Entrada</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    7:00
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/20 border border-amber-200/20 backdrop-blur-md text-black/60">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-3.5 h-3.5 text-black-200" />
                    <span className="text-[10px] font-bold">Almuerzo</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    12:00
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/20 border border-sky-200/20 backdrop-blur-md text-black/60">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-balck-200" />
                    <span className="text-[10px] font-bold">Regreso</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    1:00
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/20 border border-rose-200/20 backdrop-blur-md text-black/60">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5 text-black-200" />
                    <span className="text-[10px] font-bold">Salida</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    5:00
                  </span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-white/20 border border-amber-200/20 backdrop-blur-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-black-200 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-black/60">
                      Tolerancia
                    </p>
                    <p className="text-[9px] leading-snug text-black/70">
                      10 minutos permitidos en la entrada.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-4 bg-orange-900/5 backdrop-blur-2xl border border-white/45 rounded-[2rem] p-5 md:p-6 shadow-[0_25px_70px_rgba(50,19,14,0.22)] flex flex-col justify-between min-h-[430px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-[0.12em] text-white">
                    {modoManual ? "Selecciona tu Nombre" : "Muestra tu gafete"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setModoManual(!modoManual)}
                    className="text-[10px] font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {modoManual ? (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Usar Cámara</span>
                      </>
                    ) : (
                      <>
                        <Keyboard className="w-3.5 h-3.5" />
                        <span>Selección Manual</span>
                      </>
                    )}
                  </button>
                </div>

                {!modoManual ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-sm h-[245px] bg-[#32130E]/75 rounded-3xl overflow-hidden border border-white/40 shadow-[inset_0_0_40px_rgba(0,0,0,0.25)] flex items-center justify-center">
                      <div id="reader" className="w-full h-full" />
                      {!isCameraActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#32130E]/85 text-white/80 text-xs gap-2 z-10 pointer-events-none">
                          <CameraOff className="w-8 h-8 animate-pulse text-amber-300" />
                          <span>Iniciando cámara...</span>
                        </div>
                      )}
                    </div>

                    {selectedEmpleado && (
                      <div className="mt-3 bg-emerald-400/15 backdrop-blur-md border border-emerald-200/30 text-white px-3 py-1.5 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-200" />
                        <span>
                          {selectedEmpleado.nombre} {selectedEmpleado.apellido}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <SearchableSelect
                    options={empleados.map((emp) => ({
                      label: `${emp.nombre} ${emp.apellido} — ${emp.rol?.nombre || "Empleado"}`,
                      value: String(emp.id),
                    }))}
                    placeholder="Escribe tu nombre o apellido..."
                    onSelect={(val) => {
                      const emp = empleados.find((e) => e.id === Number(val));
                      setSelectedEmpleado(emp || null);
                    }}
                  />
                )}
              </div>

              <form onSubmit={handleMarcaje} className="space-y-3 mt-4">
                {statusMessage && (
                  <div
                    className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold border backdrop-blur-md ${statusMessage.type === "success" ? "bg-emerald-400/15 border-emerald-200/30 text-white" : "bg-rose-400/15 border-rose-200/30 text-white"}`}
                  >
                    {statusMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !selectedEmpleado}
                  size="md"
                  className="w-full py-3 text-xs md:text-sm font-bold shadow-lg gap-2 bg-[#32130E]/90 hover:bg-[#32130E] text-white rounded-2xl border border-white/20"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {loading
                      ? "Registrando marcación..."
                      : selectedEmpleado
                        ? `Confirmar Marcaje para ${selectedEmpleado.nombre}`
                        : "Escanea tu gafete o selecciona un usuario"}
                  </span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10 text-center pb-2 text-[10px] md:text-[11px] font-medium text-white/65 drop-shadow-sm">
        Sistema de Control de Asistencia &bull; Estación Kiosco con Escáner
      </div>
    </div>
  );
}
