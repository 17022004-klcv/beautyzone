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

export interface ItemOrden {
  id: number;
  tipo: "SERVICIO" | "PRODUCTO";
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  estilistaId?: number;
}

export default function POSPage() {
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [loadingCaja, setLoadingCaja] = useState(true);

  const [activePanel, setActivePanel] = useState<
    "CLIENTES" | "CITAS" | "CIERRE" | null
  >(null);

  const [cliente, setCliente] = useState<{
    id: number;
    nombre: string;
    apellido: string;
  } | null>(null);
  const [cart, setCart] = useState<ItemOrden[]>([]);
  const [metodoPago, setMetodoPago] = useState<
    "EFECTIVO" | "TARJETA" | "TRANSFERENCIA"
  >("EFECTIVO");
  const [efectivoRecibido, setEfectivoRecibido] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categorias = [
    "TODOS",
    "SERVICIOS",
    "CABELLO",
    "UÑAS",
    "FACIAL",
    "PRODUCTOS",
  ];

  const [catalogo] = useState([
    {
      id: 1,
      tipo: "SERVICIO" as const,
      nombre: "Corte de Cabello Dama",
      categoria: "SERVICIOS",
      precio: 15.0,
    },
    {
      id: 2,
      tipo: "SERVICIO" as const,
      nombre: "Tinte Completo",
      categoria: "SERVICIOS",
      precio: 45.0,
    },
    {
      id: 3,
      tipo: "SERVICIO" as const,
      nombre: "Manicure Spa",
      categoria: "UÑAS",
      precio: 12.0,
    },
    {
      id: 4,
      tipo: "PRODUCTO" as const,
      nombre: "Shampoo L'Oréal 500ml",
      categoria: "CABELLO",
      precio: 22.5,
    },
    {
      id: 5,
      tipo: "PRODUCTO" as const,
      nombre: "Aceite de Argan 100ml",
      categoria: "CABELLO",
      precio: 18.0,
    },
  ]);

  const [citasPendientes] = useState([
    {
      id: 101,
      cliente: { nombre: "María", apellido: "Gómez" },
      horaInicio: "10:30 AM",
      detallesCita: [
        {
          idservicio: 1,
          servicio: { nombre: "Corte de Cabello Dama", precio: 15.0 },
          estilista: { id: 2, nombre: "Ana" },
        },
        {
          idservicio: 3,
          servicio: { nombre: "Manicure Spa", precio: 12.0 },
          estilista: { id: 3, nombre: "Karla" },
        },
      ],
    },
  ]);

  const clientesLista = [
    {
      id: 1,
      nombre: "María",
      apellido: "Gómez",
      correo: "maria@gmail.com",
      telefono: "7788-9900",
    },
    {
      id: 2,
      nombre: "Carlos",
      apellido: "López",
      correo: "carlos@hotmail.com",
      telefono: "7123-4567",
    },
  ];

  const checkCaja = async () => {
    try {
      setLoadingCaja(true);
      const res = await CajaService.obtenerEstadoCaja();
      if (res?.activa && res?.caja) {
        setCajaActiva(res.caja);
      }
    } catch (err) {
      console.error("Error al obtener estado de caja", err);
    } finally {
      setLoadingCaja(false);
    }
  };

  useEffect(() => {
    checkCaja();
  }, []);

  // Función para vaciar completamente el carrito / nueva venta
  const handleLimpiarOrden = () => {
    if (cart.length === 0 && !cliente) return;
    if (confirm("¿Deseas cancelar esta venta y vaciar la orden actual?")) {
      setCart([]);
      setCliente(null);
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
    onCierre: () =>
      setActivePanel((prev) => (prev === "CIERRE" ? null : "CIERRE")),
    // Agrega la propiedad onLimpiar en tu custom hook si aplica
  });

  // Atajo F8 para limpiar orden
  useEffect(() => {
    const handleF8 = (e: KeyboardEvent) => {
      if (e.key === "F8") {
        e.preventDefault();
        handleLimpiarOrden();
      }
    };
    window.addEventListener("keydown", handleF8);
    return () => window.removeEventListener("keydown", handleF8);
  }, [cart, cliente]);

  const agregarAlCarrito = (item: any) => {
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

  const handleCargarCita = (cita: any) => {
    setCliente({
      id: cita.id,
      nombre: cita.cliente.nombre,
      apellido: cita.cliente.apellido,
    });
    const nuevosItems: ItemOrden[] = cita.detallesCita.map((d: any) => ({
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
      return alert("Efectivo insuficiente.");

    alert(`Venta registrada exitosamente por $${total.toFixed(2)}`);
    setCart([]);
    setCliente(null);
    setEfectivoRecibido("");
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
      {/* BARRA SUPERIOR POS */}
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

      {/* CONTENEDOR CON DISTRIBUCIÓN EQUITATIVA (50% / 50%) */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 w-full">
        {/* SECCIÓN CATÁLOGO (50% del ancho cuando no hay panel abierto) */}
        <div
          className={`flex flex-col bg-[#FDFBF9] border border-[#E6D9D0] rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${activePanel ? "w-2/5" : "w-1/1"}`}
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

          {/* GRID DE CARDS ADAPTADAS A LA PALETA */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 lg:grid-cols-3 gap-2 align-content-start">
            {itemsFiltrados.map((item) => (
              <button
                key={`${item.tipo}-${item.id}`}
                onClick={() => agregarAlCarrito(item)}
                className="group flex flex-col justify-between p-3.5 bg-white border border-[#EADBCF] rounded-xl text-left hover:border-[#32130E] hover:shadow-md transition-all h-32 relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                        item.tipo === "SERVICIO"
                          ? "bg-[#32130E] text-[#F5EBE1]"
                          : "bg-[#8C7167] text-white"
                      }`}
                    >
                      {item.tipo}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#32130E] line-clamp-2 leading-snug group-hover:text-[#522219]">
                    {item.nombre}
                  </p>
                </div>
                <div className="text-right border-t border-[#F5EBE1] pt-2 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[#8C7167] uppercase">
                    Precio
                  </span>
                  <span className="text-sm font-mono font-bold text-[#32130E]">
                    ${item.precio.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SECCIÓN ORDEN DE VENTA (50% del ancho) */}
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

          <div className="flex-1 overflow-y-auto bg-[#FDFBF9]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5F0] text-[#7A5C55] font-mono text-[10px] uppercase border-b border-[#E6D9D0] sticky top-0">
                <tr>
                  <th className="p-3 w-24">Cant</th>
                  <th className="p-3">Ítem</th>
                  <th className="p-3 text-right">Precio</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center w-10"></th>
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
                      <td className="p-3 font-bold">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => modificarCantidad(idx, -1)}
                            className="p-1 bg-[#EADBCF] rounded hover:bg-[#D8C3B3] transition-colors"
                          >
                            <Minus className="w-3 h-3 text-[#32130E]" />
                          </button>
                          <span className="px-1.5 min-w-[16px] text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => modificarCantidad(idx, 1)}
                            className="p-1 bg-[#EADBCF] rounded hover:bg-[#D8C3B3] transition-colors"
                          >
                            <Plus className="w-3 h-3 text-[#32130E]" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-[#32130E] font-semibold text-xs">
                        {item.nombre}
                      </td>
                      <td className="p-3 text-right text-[#7A5C55]">
                        ${item.precio.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-bold text-[#32130E]">
                        ${item.subtotal.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => eliminarItem(idx)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALES Y FORMA DE PAGO */}
          <div className="bg-[#FAF5F0] border-t border-[#E6D9D0] p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 bg-[#EADBCF] p-1 rounded-lg text-xs font-bold">
              {(["EFECTIVO", "TARJETA", "TRANSFERENCIA"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`py-1.5 rounded-md transition-all ${
                    metodoPago === m
                      ? "bg-[#32130E] text-white shadow-sm"
                      : "text-[#7A5C55] hover:bg-[#DFCDC1]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {metodoPago === "EFECTIVO" && (
              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-[#EADBCF]">
                <div>
                  <label className="block text-[10px] font-mono text-[#7A5C55] uppercase font-bold">
                    Recibido
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={efectivoRecibido}
                    onChange={(e) => setEfectivoRecibido(e.target.value)}
                    className="w-full text-base font-mono font-bold px-3 py-1.5 border border-[#E6D9D0] rounded-md focus:outline-none focus:border-[#32130E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#7A5C55] uppercase font-bold">
                    Cambio
                  </label>
                  <div className="text-base font-mono font-bold text-emerald-800 py-1.5 px-3 bg-emerald-50 border border-emerald-200 rounded-md">
                    ${cambio.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-[#E6D9D0] pt-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-[#7A5C55] uppercase block font-bold">
                  Total a Pagar
                </span>
                <span className="text-3xl font-mono font-bold text-[#32130E]">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLimpiarOrden}
                  className="px-4 py-3 bg-[#EADBCF] hover:bg-[#D8C3B3] text-[#32130E] text-xs font-bold uppercase rounded-lg transition-all"
                >
                  Vaciar [F8]
                </button>
                <button
                  onClick={handleFinalizarVenta}
                  disabled={cart.length === 0}
                  className="px-8 py-3 bg-[#32130E] hover:bg-[#4A241D] text-white text-xs font-bold uppercase rounded-lg shadow-md disabled:opacity-50 transition-all"
                >
                  Cobrar [F4]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL LATERAL INTEGRADO (Aparece al presionar F2, F3 o F12) */}
        {activePanel && (
          <div className="w-1/5 bg-white border border-[#E6D9D0] rounded-xl shadow-sm flex flex-col transition-all duration-300 overflow-hidden">
            <div className="p-3 bg-[#EADBCF] border-b border-[#D8C3B3] flex justify-between items-center">
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

            <div className="flex-1 overflow-y-auto p-3 bg-[#FDFBF9]">
              {activePanel === "CLIENTES" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    className="w-full p-2 text-xs border border-[#E6D9D0] rounded-lg bg-white font-mono mb-2"
                  />
                  <div className="space-y-2">
                    {clientesLista.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCliente(c);
                          setActivePanel(null);
                        }}
                        className="p-3 bg-white border border-[#EADBCF] rounded-lg hover:border-[#32130E] cursor-pointer flex justify-between items-center transition-all shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#32130E]">
                            {c.nombre} {c.apellido}
                          </p>
                          <p className="text-[10px] text-[#7A5C55] font-mono">
                            {c.telefono}
                          </p>
                        </div>
                        <Check className="w-4 h-4 text-[#8C7167]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === "CITAS" && (
                <div className="space-y-3">
                  {citasPendientes.map((cita) => (
                    <div
                      key={cita.id}
                      className="p-3 bg-white border border-[#EADBCF] rounded-lg space-y-2 shadow-sm"
                    >
                      <div className="flex justify-between items-center border-b border-[#F5EBE1] pb-1.5">
                        <span className="text-xs font-bold text-[#32130E]">
                          {cita.cliente.nombre} {cita.cliente.apellido}
                        </span>
                        <span className="text-[10px] bg-[#EADBCF] text-[#32130E] font-mono px-2 py-0.5 rounded-full font-bold">
                          {cita.horaInicio}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCargarCita(cita)}
                        className="w-full mt-2 py-1.5 bg-[#32130E] hover:bg-[#4A241D] text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                      >
                        Cargar Cita
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activePanel === "CIERRE" && (
                <div className="space-y-3 font-mono text-xs bg-white p-3 border border-[#EADBCF] rounded-lg shadow-sm">
                  <div className="border-b border-[#F5EBE1] pb-2">
                    <span className="text-[10px] text-[#7A5C55] block uppercase">
                      Monto Apertura
                    </span>
                    <strong className="text-sm text-[#32130E]">
                      ${Number(cajaActiva?.montoApertura || 0).toFixed(2)}
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      alert("Caja Cerrada Correctamente.");
                      setActivePanel(null);
                      checkCaja();
                    }}
                    className="w-full py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg uppercase tracking-wider"
                  >
                    Confirmar Cierre X
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
