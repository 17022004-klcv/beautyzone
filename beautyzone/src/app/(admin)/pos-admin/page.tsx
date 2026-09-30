"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  Calendar,
  CreditCard,
  Lock,
  Trash2,
  X,
  Check,
  Plus,
  Minus,
  RotateCcw,
  Banknote,
} from "lucide-react";

import POSActionButton from "@/src/components/pos/POSActionButton";
import CategoryFilter from "@/src/components/ui/CategoryFilter";
import DialogoPos from "@/src/components/ui/DialogoPos";
import { usePOSShortcuts } from "@/src/app/hooks/usePOSShortcuts";
import { CajaService } from "@/src/app/services/caja.service";
import { POSService } from "@/src/app/services/pos.service";
import ModalAperturaCaja from "@/src/components/pos/ModalAperturaCaja";
import type { CajaActiva } from "@/src/app/types/caja";
import {
  ItemOrden,
  ProductoServicioItem,
  Cliente,
  CitaPendiente,
} from "@/src/app/types/pos";
import type { LineaDetalle, TipoDialogo } from "@/src/components/ui/DialogoPos";

interface DialogoActivo {
  tipo: TipoDialogo;
  titulo: string;
  mensaje?: string;
  detalle?: LineaDetalle[];
  textoConfirmar?: string;
  accion?: () => void;
}

export default function POSPage() {
  const [cajaActiva, setCajaActiva] = useState<CajaActiva | null>(null);
  const [activePanel, setActivePanel] = useState<
    "CLIENTES" | "CITAS" | "CIERRE" | null
  >(null);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [citaActivaId, setCitaActivaId] = useState<number | null>(null);
  const [cart, setCart] = useState<ItemOrden[]>([]);
  const [metodoPago, setMetodoPago] = useState<
    "EFECTIVO" | "TARJETA" | "TRANSFERENCIA"
  >("EFECTIVO");
  const [efectivoRecibido, setEfectivoRecibido] = useState<string>("");
  const [modalAperturaOpen, setModalAperturaOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [catalogo, setCatalogo] = useState<ProductoServicioItem[]>([]);
  const [clientesLista, setClientesLista] = useState<Cliente[]>([]);
  const [citasPendientes, setCitasPendientes] = useState<CitaPendiente[]>([]);

  // Cierre de turno: solo totales y PIN. El conteo de billetes vive en
  // /arqueo, así que el POS no pide denom en ninguna parte.
  const [pinCierre, setPinCierre] = useState("");
  const [cerrandoTurno, setCerrandoTurno] = useState(false);
  const [errorCierre, setErrorCierre] = useState<string | null>(null);

  // Diálogos propios en vez de alert()/confirm() del navegador
  const [dialogo, setDialogo] = useState<DialogoActivo | null>(null);

  const cerrarDialogo = () => setDialogo(null);

  const categorias = [
    "TODOS",
    "SERVICIOS",
    "CABELLO",
    "UÑAS",
    "FACIAL",
    "PRODUCTOS",
  ];

  const checkCaja = async () => {
    try {
      const data = await CajaService.obtenerEstadoCaja();

      if (data.activa && data.caja) {
        setCajaActiva(data.caja);
        setModalAperturaOpen(false); // Cierra el modal si ya hay caja abierta
      } else {
        setCajaActiva(null);
        setModalAperturaOpen(true); // Abre el modal si NO hay caja activa
      }
    } catch (error) {
      console.error("Error consultando estado de caja:", error);
      setModalAperturaOpen(true);
    }
  };

  // 3. Ejecutar la verificación al montar el componente
  useEffect(() => {
    checkCaja();
  }, []);

  const cargarDatos = async () => {
    try {
      const [catData, cliData, citasData] = await Promise.all([
        POSService.obtenerCatalogo(),
        POSService.obtenerClientes(),
        POSService.obtenerCitasPendientes(),
      ]);
      setCatalogo(catData);
      setClientesLista(cliData);
      setCitasPendientes(citasData);
    } catch (error) {
      console.error("Error al cargar datos del POS", error);
    }
  };

  useEffect(() => {
    checkCaja();
    cargarDatos();
  }, []);

  const vaciarOrden = () => {
    setCart([]);
    setCliente(null);
    setCitaActivaId(null);
    setEfectivoRecibido("");
  };

  const handleLimpiarOrden = () => {
    if (cart.length === 0 && !cliente) return;
    setDialogo({
      tipo: "confirmar",
      titulo: "Vaciar la orden",
      mensaje:
        "Se quitarán todos los productos y servicios de esta orden. Esta acción no se puede deshacer.",
      textoConfirmar: "Sí, vaciar",
      accion: () => {
        vaciarOrden();
        setDialogo(null);
      },
    });
  };

  usePOSShortcuts({
    onBuscar: () => searchInputRef.current?.focus(),
    onCliente: () =>
      setActivePanel((prev) => (prev === "CLIENTES" ? null : "CLIENTES")),
    onCitas: () =>
      setActivePanel((prev) => (prev === "CITAS" ? null : "CITAS")),
    onFacturar: () => handleFinalizarVenta(),
    onVaciar: () => handleLimpiarOrden(),
    onCierre: abrirPanelCierre,
  });

  const agregarAlCarrito = (item: ProductoServicioItem) => {
    setCart((prev) => {
      const existe = prev.find((i) => i.id === item.id && i.tipo === item.tipo);
      if (existe) {
        return prev.map((i) =>
          i.id === item.id && i.tipo === item.tipo
            ? {
                ...i,
                cantidad: i.cantidad + 1,
                subtotal: (i.cantidad + 1) * i.precio,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          tipo: item.tipo,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: 1,
          subtotal: item.precio,
        },
      ];
    });
  };

  const modificarCantidad = (index: number, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item, i) => {
            if (i === index) {
              const nuevaCantidad = item.cantidad + delta;
              return nuevaCantidad > 0
                ? {
                    ...item,
                    cantidad: nuevaCantidad,
                    subtotal: nuevaCantidad * item.precio,
                  }
                : null;
            }
            return item;
          })
          .filter(Boolean) as ItemOrden[],
    );
  };

  const eliminarItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const numEfectivo = parseFloat(efectivoRecibido) || 0;
  const cambio = numEfectivo > total ? numEfectivo - total : 0;

  const handleCargarCita = (cita: CitaPendiente) => {
    setCliente({
      id: cita.cliente.id,
      nombre: cita.cliente.nombre,
      apellido: cita.cliente.apellido,
    });
    setCitaActivaId(cita.id);

    const nuevosItems: ItemOrden[] = cita.detallesCita.map((d) => ({
      id: d.idservicio,
      tipo: "SERVICIO" as const,
      nombre: d.servicio.nombre,
      precio: Number(d.servicio.precio),
      cantidad: 1,
      subtotal: Number(d.servicio.precio),
      estilistaId: d.estilista.id,
    }));

    setCart((prev) => [...prev, ...nuevosItems]);
    setActivePanel(null);
  };

  const handleFinalizarVenta = async () => {
    if (!cajaActiva) {
      setDialogo({
        tipo: "error",
        titulo: "No hay caja abierta",
        mensaje: "Abre tu turno de caja antes de registrar una venta.",
      });
      return;
    }

    if (cart.length === 0) {
      setDialogo({
        tipo: "error",
        titulo: "Orden vacía",
        mensaje: "Agrega al menos un producto o servicio antes de cobrar.",
      });
      return;
    }

    if (metodoPago === "EFECTIVO" && numEfectivo < total) {
      const faltan = total - numEfectivo;
      setDialogo({
        tipo: "error",
        titulo: "Saldo insuficiente",
        mensaje: `El efectivo recibido no cubre el total de la orden. Faltan $${faltan.toFixed(2)}.`,
        detalle: [
          { etiqueta: "Total a cobrar", valor: `$${total.toFixed(2)}` },
          {
            etiqueta: "Efectivo recibido",
            valor: `$${numEfectivo.toFixed(2)}`,
          },
          {
            etiqueta: "Falta",
            valor: `-$${faltan.toFixed(2)}`,
            destacado: true,
          },
        ],
      });
      return;
    }

    try {
      await POSService.registrarVenta({
        cajaTurnoId: cajaActiva.id,
        // El cajero es quien abrió el turno, no un id fijo.
        idempleadoCaja: cajaActiva.cajero.id,
        clienteId: cliente?.id,
        citaId: citaActivaId || undefined,
        metodoPago,
        montoTotal: total,
        items: cart.map((i) => ({
          itemId: i.id,
          tipo: i.tipo,
          cantidad: i.cantidad,
          precioUnitario: i.precio,
          subtotal: i.subtotal,
          estilistaId: i.estilistaId,
        })),
      });

      const detalle: LineaDetalle[] = [
        { etiqueta: "Total", valor: `$${total.toFixed(2)}` },
        { etiqueta: "Método de pago", valor: metodoPago },
      ];

      // El cambio solo aplica cuando el cliente paga en efectivo.
      if (metodoPago === "EFECTIVO" && numEfectivo > total) {
        detalle.push({
          etiqueta: "Cambio",
          valor: `$${cambio.toFixed(2)}`,
          destacado: true,
        });
      }

      setDialogo({
        tipo: "exito",
        titulo: "¡Muchas gracias por tu compra!",
        mensaje: "Tu pago se registró correctamente.",
        detalle,
      });

      setCart([]);
      setCliente(null);
      setCitaActivaId(null);
      setEfectivoRecibido("");
      checkCaja(); // Refresca los totales del turno para el panel de cierre
    } catch (err: any) {
      setDialogo({
        tipo: "error",
        titulo: "No se pudo registrar la venta",
        mensaje: err.message || "Ocurrió un error al procesar la venta.",
      });
    }
  };

  const itemsFiltrados = catalogo.filter((item) => {
    const coincideBusqueda = item.nombre
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const coincideCategoria =
      selectedCategory === "TODOS" || item.categoria === selectedCategory;
    return coincideBusqueda && coincideCategoria;
  });

  // Desglose del turno activo para el panel de cierre. GET /api/caja ya
  // devuelve estos montos como number, no como Decimal.
  const resumenCierre = {
    apertura: cajaActiva?.montoApertura ?? 0,
    efectivo: cajaActiva?.resumenVentas.efectivo ?? 0,
    tarjeta: cajaActiva?.resumenVentas.tarjeta ?? 0,
    transferencia: cajaActiva?.resumenVentas.transferencia ?? 0,
    totalVendido: cajaActiva?.resumenVentas.totalAcumuladoVentas ?? 0,
  };

  // Lo que debería haber en el cajón: apertura + ventas en efectivo.
  const montoEsperadoCierre = Number(
    (resumenCierre.apertura + resumenCierre.efectivo).toFixed(2),
  );

  function abrirPanelCierre() {
    setPinCierre("");
    setErrorCierre(null);
    setActivePanel((prev) => (prev === "CIERRE" ? null : "CIERRE"));
  }

  const handleCerrarTurno = async () => {
    if (!cajaActiva) return;
    if (!pinCierre.trim()) {
      setErrorCierre("Ingresa el PIN de caja para confirmar el cierre.");
      return;
    }

    try {
      setCerrandoTurno(true);
      setErrorCierre(null);

      // Solo se envía el PIN: el conteo de billetes se hace en /arqueo.
      const resumen = await CajaService.cerrarCaja({
        idcajaTurno: cajaActiva.id,
        passwordPin: pinCierre.trim(),
      });

      setPinCierre("");
      setActivePanel(null);
      checkCaja();

      setDialogo({
        tipo: "exito",
        titulo: "Turno de caja cerrado",
        mensaje:
          "El conteo de billetes y monedas queda pendiente en la pantalla de Arqueo.",
        detalle: [
          { etiqueta: "Apertura", valor: `$${resumen.montoApertura.toFixed(2)}` },
          { etiqueta: "Efectivo", valor: `$${resumen.ventasEfectivo.toFixed(2)}` },
          { etiqueta: "Tarjeta", valor: `$${resumen.ventasTarjeta.toFixed(2)}` },
          {
            etiqueta: "Transferencia",
            valor: `$${resumen.ventasTransferencia.toFixed(2)}`,
          },
          {
            etiqueta: "Total vendido",
            valor: `$${resumen.totalVendido.toFixed(2)}`,
            destacado: true,
          },
          {
            etiqueta: "Esperado en caja",
            valor: `$${resumen.montoEsperado.toFixed(2)}`,
          },
        ],
      });
    } catch (err: any) {
      setErrorCierre(err.message || "Error al cerrar el turno de caja.");
    } finally {
      setCerrandoTurno(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F6F2EF] font-sans select-none overflow-hidden">
      <ModalAperturaCaja
        isOpen={modalAperturaOpen}
        onAperturaExitosa={() => {
          setModalAperturaOpen(false);
          checkCaja(); // Revisa y carga los datos de la caja abierta
        }}
      />

      {/* BARRA SUPERIOR */}
      <div className="text-[#F5EBE1] p-2 border-b border-[#4A241D] m-4">
        <div className="flex items-center justify-between gap-2">
          <POSActionButton
            shortcut="F1"
            label="Buscar"
            icon={Search}
            onClick={() => searchInputRef.current?.focus()}
          />
          <POSActionButton
            shortcut="F2"
            label={cliente ? `${cliente.nombre}` : "Cliente"}
            icon={User}
            onClick={() =>
              setActivePanel(activePanel === "CLIENTES" ? null : "CLIENTES")
            }
          />
          <POSActionButton
            shortcut="F3"
            label={`Citas (${citasPendientes.length})`}
            icon={Calendar}
            onClick={() =>
              setActivePanel(activePanel === "CITAS" ? null : "CITAS")
            }
          />
          <POSActionButton
            shortcut="F4"
            label="Cobrar"
            icon={CreditCard}
            variant="primary"
            onClick={handleFinalizarVenta}
          />
          <POSActionButton
            shortcut="F8"
            label="Vaciar"
            icon={RotateCcw}
            onClick={handleLimpiarOrden}
          />
          <POSActionButton
            shortcut="F12"
            label="Cierre X"
            icon={Lock}
            variant="danger"
            onClick={abrirPanelCierre}
          />
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 w-full">
        {/* CATÁLOGO DE PRODUCTOS / SERVICIOS */}
        <div
          className={`flex flex-col bg-[#FDFBF9] border border-[#E6D9D0] rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${activePanel ? "w-1/5" : "w-1/1"}`}
        >
          <div className="p-3 border-b border-[#E6D9D0] bg-[#FAF5F0] flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C7167]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="[F1] Buscar producto o servicio..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E6D9D0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#32130E] font-mono text-[#32130E]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CategoryFilter
              categories={categorias}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <div className="flex-1 p-3 overflow-y-auto" data-simplebar>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 align-content-start">
              {itemsFiltrados.map((item) => (
                <button
                  key={`${item.tipo}-${item.id}`}
                  onClick={() => agregarAlCarrito(item)}
                  className="group flex flex-col justify-between p-2 bg-white border border-[#EADBCF] rounded-lg text-left hover:border-[#32130E] hover:shadow-sm transition-all h-20 relative overflow-hidden"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${item.tipo === "SERVICIO" ? "bg-[#32130E] text-[#F5EBE1]" : "bg-[#8C7167] text-white"}`}
                      >
                        {item.categoria}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-[#32130E] line-clamp-1 leading-snug group-hover:text-[#522219]">
                      {item.nombre}
                    </p>
                  </div>
                  <div className="text-right border-t border-[#F5EBE1] pt-1">
                    <span className="text-xs font-mono font-bold text-[#32130E]">
                      ${item.precio.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ORDEN DE VENTA */}
        <div
          className={`flex flex-col bg-white border border-[#E6D9D0] rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${activePanel ? "w-2/5" : "w-1/3"}`}
        >
          <div className="bg-[#32130E] text-[#F5EBE1] p-3 flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold">ORDEN DE VENTA</span>
            </div>
            <span className="text-[#D8C3B3]">
              CLIENTE:{" "}
              <strong className="text-white">
                {cliente ? `${cliente.nombre} ${cliente.apellido}` : "CONTADO"}
              </strong>
            </span>
          </div>

          <div className="flex-1 bg-[#FDFBF9] overflow-y-auto" data-simplebar>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5F0] text-[#7A5C55] font-mono text-[10px] uppercase border-b border-[#E6D9D0] sticky top-0 z-10">
                <tr>
                  <th className="p-2.5 w-24">Cant</th>
                  <th className="p-2.5">Ítem</th>
                  <th className="p-2.5 text-right">Precio</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE1] font-mono">
                {cart.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-20 text-[#8C7167] text-xs italic"
                    >
                      Sin ítems en la orden. Selecciona un producto o servicio.
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF5F0]">
                      <td className="p-2 font-bold">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => modificarCantidad(idx, -1)}
                            className="p-0.5 bg-[#EADBCF] rounded hover:bg-[#D8C3B3] transition-colors"
                          >
                            <Minus className="w-3 h-3 text-[#32130E]" />
                          </button>
                          <span className="px-1 min-w-[16px] text-center text-xs">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => modificarCantidad(idx, 1)}
                            className="p-0.5 bg-[#EADBCF] rounded hover:bg-[#D8C3B3] transition-colors"
                          >
                            <Plus className="w-3 h-3 text-[#32130E]" />
                          </button>
                        </div>
                      </td>
                      <td className="p-2 text-[#32130E] font-semibold text-xs">
                        {item.nombre}
                      </td>
                      <td className="p-2 text-right text-[#7A5C55]">
                        ${item.precio.toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-bold text-[#32130E]">
                        ${item.subtotal.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => eliminarItem(idx)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALES Y FORMA DE PAGO */}
          <div className="bg-[#FAF5F0] border-t border-[#E6D9D0] p-2.5 space-y-2">
            <div className="grid grid-cols-3 gap-1.5 bg-[#EADBCF] p-1 rounded-lg text-[11px] font-bold">
              {(["EFECTIVO", "TARJETA", "TRANSFERENCIA"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`py-1 rounded-md transition-all ${metodoPago === m ? "bg-[#32130E] text-white shadow-sm" : "text-[#7A5C55] hover:bg-[#DFCDC1]"}`}
                >
                  {m}
                </button>
              ))}
            </div>

            {metodoPago === "EFECTIVO" && (
              <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-[#EADBCF]">
                <div>
                  <label className="block text-[9px] font-mono text-[#7A5C55] uppercase font-bold">
                    Recibido
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={efectivoRecibido}
                    onChange={(e) => setEfectivoRecibido(e.target.value)}
                    className="w-full text-sm font-mono font-bold px-2 py-1 border border-[#E6D9D0] rounded focus:outline-none focus:border-[#32130E]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-[#7A5C55] uppercase font-bold">
                    Cambio
                  </label>
                  <div className="text-sm font-mono font-bold text-[#32130E] py-1 px-2 border border-[#E6D9D0] rounded bg-[#FAF5F0]">
                    ${cambio.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-[#E6D9D0] pt-2 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-[#7A5C55] uppercase block font-bold">
                  Total a Pagar
                </span>
                <span className="text-2xl font-mono font-bold text-[#32130E]">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleLimpiarOrden}
                  className="px-3 py-1.5 bg-[#EADBCF] hover:bg-[#D8C3B3] text-[#32130E] text-[11px] font-bold uppercase rounded-md transition-all"
                >
                  Vaciar [F8]
                </button>
                <button
                  onClick={handleFinalizarVenta}
                  disabled={cart.length === 0}
                  className="px-5 py-1.5 bg-[#32130E] hover:bg-[#4A241D] text-white text-[11px] font-bold uppercase rounded-md shadow-md disabled:opacity-50 transition-all"
                >
                  Cobrar [F4]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANELS DESPLEGABLES */}
        {activePanel && (
          <div className="w-1/2 bg-white border border-[#E6D9D0] rounded-xl shadow-sm flex flex-col transition-all duration-300 overflow-hidden">
            <div className="p-2.5 bg-[#EADBCF] border-b border-[#D8C3B3] flex justify-between items-center">
              <h3 className="font-bold text-xs text-[#32130E] uppercase font-mono tracking-wider">
                {activePanel === "CLIENTES" && "Clientes [F2]"}
                {activePanel === "CITAS" && "Citas [F3]"}
                {activePanel === "CIERRE" && "Cierre [F12]"}
              </h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 text-[#7A5C55] hover:text-[#32130E] hover:bg-[#F5EBE1] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className="flex-1 p-2 bg-[#FDFBF9] overflow-y-auto"
              data-simplebar
            >
              {activePanel === "CLIENTES" && (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    {clientesLista.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCliente(c);
                          setActivePanel(null);
                        }}
                        className="p-2 bg-white border border-[#EADBCF] rounded-lg hover:border-[#32130E] cursor-pointer flex justify-between items-center transition-all shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#32130E]">
                            {c.nombre} {c.apellido}
                          </p>
                          <p className="text-[10px] text-[#7A5C55] font-mono">
                            {c.telefono}
                          </p>
                        </div>
                        <Check className="w-3.5 h-3.5 text-[#8C7167]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === "CITAS" && (
                <div className="space-y-2">
                  {citasPendientes.map((cita) => (
                    <div
                      key={cita.id}
                      className="p-2 bg-white border border-[#EADBCF] rounded-lg space-y-1.5 shadow-sm"
                    >
                      <div className="flex justify-between items-center border-b border-[#F5EBE1] pb-1">
                        <span className="text-xs font-bold text-[#32130E]">
                          {cita.cliente.nombre} {cita.cliente.apellido}
                        </span>
                        <span className="text-[9px] bg-[#EADBCF] text-[#32130E] font-mono px-1.5 py-0.5 rounded-full font-bold">
                          {cita.horaInicio}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCargarCita(cita)}
                        className="w-full mt-1 py-1 bg-[#32130E] hover:bg-[#4A241D] text-white text-[10px] font-bold rounded uppercase tracking-wider"
                      >
                        Cargar Cita
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activePanel === "CIERRE" && (
                <div className="space-y-3 bg-white p-3 border border-[#EADBCF] rounded-lg shadow-sm font-mono">
                  {errorCierre && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold">
                      {errorCierre}
                    </div>
                  )}

                  {/* RESUMEN REGISTRADO POR EL SISTEMA */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="col-span-2 p-2 bg-[#EADBCF]/60 border border-[#D8C3B3] rounded-lg">
                      <span className="text-[9px] text-[#7A5C55] block uppercase tracking-wider">
                        Monto de Apertura
                      </span>
                      <strong className="text-sm text-[#32130E]">
                        ${resumenCierre.apertura.toFixed(2)}
                      </strong>
                    </div>
                    <div className="p-2 border border-[#F5EBE1] rounded-lg">
                      <span className="text-[9px] text-[#7A5C55] block uppercase tracking-wider">
                        Efectivo
                      </span>
                      <strong className="text-xs text-[#2E6F40]">
                        ${resumenCierre.efectivo.toFixed(2)}
                      </strong>
                    </div>
                    <div className="p-2 border border-[#F5EBE1] rounded-lg">
                      <span className="text-[9px] text-[#7A5C55] block uppercase tracking-wider">
                        Tarjeta
                      </span>
                      <strong className="text-xs text-[#4A6D8C]">
                        ${resumenCierre.tarjeta.toFixed(2)}
                      </strong>
                    </div>
                    <div className="col-span-2 p-2 border border-[#F5EBE1] rounded-lg">
                      <span className="text-[9px] text-[#7A5C55] block uppercase tracking-wider">
                        Transferencia
                      </span>
                      <strong className="text-xs text-[#9D4B4C]">
                        ${resumenCierre.transferencia.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t-2 border-[#32130E] pt-2">
                    <span className="text-[10px] text-[#32130E] font-bold uppercase tracking-wider">
                      Total Vendido
                    </span>
                    <span className="text-base font-bold text-[#32130E]">
                      ${resumenCierre.totalVendido.toFixed(2)}
                    </span>
                  </div>

                  {/* AVISO: el conteo de billetes se hace en /arqueo */}
                  <div className="flex items-start gap-2 rounded-lg border border-[#EADBCF] bg-[#EADBCF]/40 p-2">
                    <Banknote size={14} className="mt-0.5 shrink-0 text-[#7A5C55]" />
                    <p className="text-[10px] leading-snug text-[#7A5C55]">
                      El conteo de billetes y monedas se registra en la
                      pantalla de Arqueo, después de cerrar el turno.
                    </p>
                  </div>

                  {/* ESPERADO EN CAJA */}
                  <div className="flex items-center justify-between border-t-2 border-[#32130E] pt-2">
                    <span className="text-[10px] text-[#32130E] font-bold uppercase tracking-wider">
                      Esperado en caja
                    </span>
                    <span className="text-base font-bold text-[#32130E]">
                      ${montoEsperadoCierre.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-[#E6D9D0] pt-2">
                    <label className="block text-[9px] text-[#7A5C55] uppercase tracking-wider font-bold mb-1">
                      PIN de caja
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={pinCierre}
                      onChange={(e) => setPinCierre(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      className="w-full px-2 py-1.5 text-sm font-mono tracking-widest text-[#32130E] bg-white border border-[#E6D9D0] rounded focus:outline-none focus:ring-1 focus:ring-[#32130E]"
                    />
                  </div>

                  <button
                    onClick={handleCerrarTurno}
                    disabled={cerrandoTurno || !cajaActiva}
                    className="w-full py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-[10px] font-bold rounded uppercase tracking-wider transition"
                  >
                    {cerrandoTurno ? "Cerrando..." : "Confirmar Cierre de Caja"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Diálogos propios: reemplazan los alert()/confirm() del navegador */}
      <DialogoPos
        abierto={dialogo !== null}
        tipo={dialogo?.tipo ?? "exito"}
        titulo={dialogo?.titulo ?? ""}
        mensaje={dialogo?.mensaje}
        detalle={dialogo?.detalle}
        textoConfirmar={dialogo?.textoConfirmar}
        onConfirmar={dialogo?.accion}
        onCerrar={cerrarDialogo}
      />
    </div>
  );
}
