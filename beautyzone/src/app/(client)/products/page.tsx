"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Star,
  Search,
  Filter,
  Check,
  Sparkles,
} from "lucide-react";

const categories = [
  "Todos",
  "Cuidado Capilar",
  "Tratamiento",
  "Manicura",
  "Styling",
];

const allProducts = [
  {
    id: 1,
    name: "Sérum Capilar Reparador Argan",
    category: "Cuidado Capilar",
    price: 34.0,
    rating: 4.9,
    reviews: 128,
    img: "/img/producto1.jpg",
    inStock: true,
    badge: "Más Vendido",
  },
  {
    id: 2,
    name: "Mascarilla Nutritiva Karité",
    category: "Tratamiento",
    price: 28.5,
    rating: 4.8,
    reviews: 94,
    img: "/img/producto2.jpg",
    inStock: true,
    badge: null,
  },
  {
    id: 3,
    name: "Aceite Esencial Cutículas Gold",
    category: "Manicura",
    price: 18.0,
    rating: 5.0,
    reviews: 62,
    img: "/img/producto3.jpg",
    inStock: true,
    badge: "Nuevo",
  },
  {
    id: 4,
    name: "Protector Térmico B-Zone",
    category: "Styling",
    price: 22.0,
    rating: 4.7,
    reviews: 45,
    img: "/img/producto4.jpg",
    inStock: true,
    badge: null,
  },
  {
    id: 5,
    name: "Champú Sin Sulfatos Restructurante",
    category: "Cuidado Capilar",
    price: 26.0,
    rating: 4.9,
    reviews: 110,
    img: "/img/producto1.jpg",
    inStock: true,
    badge: null,
  },
  {
    id: 6,
    name: "Crema de Peinado Definición Rizos",
    category: "Styling",
    price: 24.5,
    rating: 4.6,
    reviews: 38,
    img: "/img/producto2.jpg",
    inStock: false,
    badge: "Agotado",
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems] = useState<number[]>([]);

  const handleAddToCart = (id: number) => {
    setAddedItems((prev) => [...prev, id]);
    setTimeout(() => {
      setAddedItems((prev) => prev.filter((itemId) => itemId !== id));
    }, 2000);
  };

  const filteredProducts = allProducts.filter((prod) => {
    const matchesCategory =
      selectedCategory === "Todos" || prod.category === selectedCategory;
    const matchesSearch = prod.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* ENCABEZADO */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-widest">
          <ShoppingBag className="w-3.5 h-3.5" /> Boutique & Care
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900">
          Productos Exclusivos
        </h1>
        <p className="text-stone-600 text-sm md:text-base font-light">
          Fórmulas profesionales seleccionadas por nuestros estilistas para
          mantener la salud y el brillo de tu cabello en casa.
        </p>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
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

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const isAdded = addedItems.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Imagen y Badges */}
                  <div className="relative h-60 w-full bg-stone-100 rounded-xl mb-4 overflow-hidden">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        {product.badge === "Más Vendido" && (
                          <Sparkles className="w-3 h-3 text-amber-400" />
                        )}
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Info del Producto */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                      {product.category}
                    </span>
                    <h3 className="font-serif font-bold text-stone-900 text-lg leading-snug">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold ml-1">{product.rating}</span>
                      </div>
                      <span className="text-stone-400">
                        ({product.reviews} opiniones)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Precio y Botón de Carrito */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-serif font-bold text-2xl text-stone-900">
                    ${product.price.toFixed(2)}
                  </span>

                  <button
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      !product.inStock
                        ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                        : isAdded
                          ? "bg-emerald-600 text-white shadow-md"
                          : "bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Añadido
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />{" "}
                        {product.inStock ? "Añadir" : "Agotado"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-500 text-sm">
            No se encontraron productos en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}
