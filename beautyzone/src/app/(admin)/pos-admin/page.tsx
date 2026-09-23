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
} from "lucide-react";

import POSActionButton from "@/src/components/pos/POSActionButton";
import CategoryFilter from "@/src/components/ui/CategoryFilter";
import { usePOSShortcuts } from "@/src/app/hooks/usePOSShortcuts";
import { CajaService } from "@/src/app/services/caja.service";
import { POSService } from "@/src/app/services/pos.service";
import ModalAperturaCaja from "@/src/components/pos/ModalAperturaCaja";
import {
  ItemOrden,
  ProductoServicioItem,
  Cliente,
  CitaPendiente,
} from "@/src/app/types/pos";

export default function POSPage() {
  const [cajaActiva, setCajaActiva] = useState<any>(null);
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
      const res = await fetch("/api/caja");
      const data = await res.json();

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

  const handleLimpiarOrden = () => {
    if (cart.length === 0 && !cliente) return;
    if (confirm("¿Deseas vaciar la orden actual?")) {
      setCart([]);
      setCliente(null);
      setCitaActivaId(null);
      setEfectivoRecibido("");
    }
  };

  usePOSShortcuts({
    onBuscar: () => searchInputRef.current?.focus(),
    onCliente: () =>
      setActivePanel((prev) => (prev === "CLIENTES" ? null : "CLIENTES")),
    onCitas: () =>
      setActivePanel((prev) => (prev === "CITAS" ? null : "CITAS")),
    onFacturar: () => handleFinalizarVenta(),
    onVaciar: () => handleLimpiarOrden(),
    onCierre: () =>
      setActivePanel((prev) => (prev === "CIERRE" ? null : "CIERRE")),
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
    if (cart.length === 0) return alert("La orden está vacía.");
    if (metodoPago === "EFECTIVO" && numEfectivo < total)
      return alert("Monto recibido es menor al total.");

    try {
      await POSService.registrarVenta({
        cajaTurnoId: cajaActiva?.id,
        idempleadoCaja: 1, // ID del usuario cajero en sesión
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

      alert(`Venta guardada con éxito por $${total.toFixed(2)}`);
      setCart([]);
      setCliente(null);
      setCitaActivaId(null);
      setEfectivoRecibido("");
    } catch (err: any) {
      alert(err.message || "Error al procesar la venta");
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

  return (
    <div className="h-screen w-full flex flex-col bg-[#F0ECEA] font-sans select-none overflow-hidden">
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
            onClick={() =>
              setActivePanel(activePanel === "CIERRE" ? null : "CIERRE")
            }
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
                <div className="space-y-2 font-mono text-xs bg-white p-2 border border-[#EADBCF] rounded-lg shadow-sm">
                  <div className="border-b border-[#F5EBE1] pb-1.5">
                    <span className="text-[9px] text-[#7A5C55] block uppercase">
                      Monto Apertura
                    </span>
                    <strong className="text-xs text-[#32130E]">
                      ${Number(cajaActiva?.montoApertura || 0).toFixed(2)}
                    </strong>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const pin = prompt(
                          "Ingrese la contraseña o PIN de caja para confirmar el cierre:",
                        );
                        if (!pin) return; // Si cancela o deja vacío, detiene la ejecución

                        await POSService.realizarCierreX(
                          cajaActiva?.id || 1,
                          pin,
                        );
                        alert("Caja Cerrada Correctamente.");
                        setActivePanel(null);
                        checkCaja();
                      } catch (e: any) {
                        alert(e.message);
                      }
                    }}
                  >
                    Confirmar Cierre de Caja
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
