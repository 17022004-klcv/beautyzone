"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Scissors,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Star,
  Calendar,
} from "lucide-react";

// Datos del Carrusel Hero con atributo `img`
const heroSlides = [
  {
    title: "Siente la elegancia en cada detalle",
    subtitle:
      "Cortes, peinados y tratamientos exclusivos adaptados a tu estilo único.",
    badge: "Tendencias 2026",
    img: "/img/salon1.png",
  },
  {
    title: "Colorimetría & Balayage Profesional",
    subtitle:
      "Transforma tu imagen con pigmentos de alta gama que cuidan la salud de tu cabello.",
    badge: "Especialistas en Color",
    img: "/img/salon2.png",
  },
  {
    title: "Cuidado Facial & Spa Relax",
    subtitle:
      "Experiencias de relajación profunda e hidratación de nivel estético.",
    badge: "Bienestar Integral",
    img: "/img/salon3.png",
  },
  {
    title: "Estilismo Exclusivo B-Zone",
    subtitle:
      "Atención personalizada con los estándares más altos de la industria.",
    badge: "Exclusividad",
    img: "/img/salon4.png",
  },
];

// Productos destacados con rutas de imágenes
const featuredProducts = [
  {
    id: 1,
    name: "Sérum Capilar Reparador Argan",
    price: "$34.00",
    rating: "4.9",
    category: "Cuidado Capilar",
    img: "/img/producto1.jpg",
  },
  {
    id: 2,
    name: "Mascarilla Nutritiva Karité",
    price: "$28.50",
    rating: "4.8",
    category: "Tratamiento",
    img: "/img/producto2.jpg",
  },
  {
    id: 3,
    name: "Aceite Esencial Cutículas Gold",
    price: "$18.00",
    rating: "5.0",
    category: "Manicura",
    img: "/img/producto3.jpg",
  },
  {
    id: 4,
    name: "Protector Térmico B-Zone",
    price: "$22.00",
    rating: "4.7",
    category: "Styling",
    img: "/img/producto4.jpg",
  },
];

// Servicios destacados con rutas de imágenes
const featuredServices = [
  {
    id: 1,
    name: "Balayage + Matizado & Olaplex",
    duration: "180 min",
    price: "$120.00",
    img: "/img/servicio1.jpg",
  },
  {
    id: 2,
    name: "Corte Estilizado + Peinado Glam",
    duration: "60 min",
    price: "$45.00",
    img: "/img/servicio2.jpg",
  },
  {
    id: 3,
    name: "Manicura Rusa con Gel Spa",
    duration: "90 min",
    price: "$35.00",
    img: "/img/servicio3.jpg",
  },
  {
    id: 4,
    name: "Hidratación Profunda Ácido Hialurónico",
    duration: "75 min",
    price: "$65.00",
    img: "/img/servicio4.jpg",
  },
];

export default function ClientHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  return (
    <div className="space-y-16 pb-16">
      {/* CARRUSEL HERO */}
      <section className="relative h-[520px] w-full overflow-hidden bg-stone-900">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.img}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-900/40" />

            <div className="relative z-10 h-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center text-white space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-rose-200 text-xs font-semibold tracking-widest uppercase border border-white/20">
                <Sparkles className="w-3.5 h-3.5" /> {slide.badge}
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                {slide.title}
              </h1>
              <p className="text-stone-200 text-base md:text-lg font-light max-w-2xl">
                {slide.subtitle}
              </p>
              <div className="pt-2">
                <Link
                  href="/reservas"
                  className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Agendar Cita
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Botones de Navegación */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? "w-8 bg-rose-500" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* SECCIÓN: SERVICIOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Servicios Destacados
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Los tratamientos más solicitados por nuestros clientes
            </p>
          </div>
          <Link
            href="/servicios"
            className="text-sm font-semibold text-rose-600 hover:underline"
          >
            Ver catálogo completo →
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="min-w-[280px] md:min-w-[320px] bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow snap-start flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-stone-100">
                  <Image
                    src={service.img}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-rose-600 flex items-center justify-center shadow-sm">
                    <Scissors className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-stone-900 text-lg">
                    {service.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Duración aprox: {service.duration}
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between">
                <span className="font-serif font-bold text-xl text-stone-900">
                  {service.price}
                </span>
                <Link
                  href={`/reservas?servicio=${service.id}`}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Agendar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN: PRODUCTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Productos Exclusivos
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Lleva el cuidado profesional del salón a tu hogar
            </p>
          </div>
          <Link
            href="/productos"
            className="text-sm font-semibold text-rose-600 hover:underline"
          >
            Ver tienda online →
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="min-w-[240px] md:min-w-[270px] bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all snap-start flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-stone-100 rounded-xl mb-4 overflow-hidden">
                  <Image
                    src={prod.img}
                    alt={prod.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  {prod.category}
                </span>
                <h3 className="font-semibold text-stone-900 text-sm mt-2 line-clamp-1">
                  {prod.name}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-semibold">{prod.rating}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="font-serif font-bold text-lg text-stone-900">
                  {prod.price}
                </span>
                <button
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                  title="Añadir al carrito"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
