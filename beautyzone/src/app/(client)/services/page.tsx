"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Scissors,
  Clock,
  Search,
  Calendar,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const categories = ["Todos", "Cabello", "Colorimetría", "Uñas", "Spa & Facial"];

const allServices = [
  {
    id: 1,
    name: "Balayage + Matizado & Olaplex",
    category: "Colorimetría",
    duration: "180 min",
    price: "$120.00",
    description:
      "Técnica de aclaración gradual con acabado natural. Incluye tratamiento reconstructor Olaplex y matizado personalizado.",
    img: "/img/servicio1.png",
    popular: true,
  },
  {
    id: 2,
    name: "Corte Estilizado + Peinado Glam",
    category: "Cabello",
    duration: "60 min",
    price: "$45.00",
    description:
      "Asesoría de visagismo, lavado masajista, corte según forma de rostro y peinado profesional a elección.",
    img: "/img/servicio2.png",
    popular: true,
  },
  {
    id: 3,
    name: "Manicura Rusa con Gel Spa",
    category: "Uñas",
    duration: "90 min",
    price: "$35.00",
    description:
      "Limpieza profunda de cutículas con torno técnico, nivelación de uña natural y esmaltado en gel de larga duración.",
    img: "/img/servicio3.png",
    popular: false,
  },
  {
    id: 4,
    name: "Hidratación Profunda Ácido Hialurónico",
    category: "Spa & Facial",
    duration: "75 min",
    price: "$65.00",
    description:
      "Tratamiento facial intensivo que restaura la humedad, reduce líneas de expresión y aporta luminosidad inmediata.",
    img: "/img/servicio4.png",
    popular: true,
  },
  {
    id: 5,
    name: "Pedicura Spa con Reflexología",
    category: "Uñas",
    duration: "60 min",
    price: "$40.00",
    description:
      "Exfoliación con sales marinas, mascarilla de parafina caliente, masaje estimulante y esmaltado.",
    img: "/img/servicio1.png",
    popular: false,
  },
  {
    id: 6,
    name: "Tinte Raíz + Tratamiento de Brillo",
    category: "Colorimetría",
    duration: "90 min",
    price: "$55.00",
    description:
      "Cobertura total de canas o retoque de color base con pigmentos orgánicos y baño de gloss abrillantador.",
    img: "/img/servicio2.png",
    popular: false,
  },
];

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = allServices.filter((service) => {
    const matchesCategory =
      selectedCategory === "Todos" || service.category === selectedCategory;
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* ENCABEZADO */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-widest">
          <Scissors className="w-3.5 h-3.5" /> Menú de Experiencias
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900">
          Nuestros Servicios
        </h1>
        <p className="text-stone-600 text-sm md:text-base font-light">
          Diseñados para realzar tu belleza natural con técnicas de vanguardia y
          productos de estándar profesional.
        </p>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
        {/* Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* GRILLA DE SERVICIOS */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Imagen del Servicio */}
                <div className="relative h-52 w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={service.img}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {service.popular && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Popular
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-stone-800 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-sm">
                    {service.category}
                  </span>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration}</span>
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-xl leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Pie de la Tarjeta */}
              <div className="p-6 pt-0 border-t border-stone-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                    Precio desde
                  </span>
                  <span className="font-serif font-bold text-2xl text-stone-900">
                    {service.price}
                  </span>
                </div>

                <Link
                  href={`/reservas?servicio=${service.id}`}
                  className="bg-stone-900 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" /> Reservar
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-500 text-sm">
            No se encontraron servicios que coincidan con tu búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
