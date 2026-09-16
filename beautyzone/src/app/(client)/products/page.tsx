"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Star,
  Search,
  Check,
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";

import PageTitle from "@/src/components/ui/PageTitle";
import CategoryFilter from "@/src/components/ui/CategoryFilter";
import Button from "@/src/components/ui/Button";
import DataTable from "@/src/components/ui/DataTable";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  img: string;
  inStock: boolean;
  badge: string | null;
}

const categories = [
  "Todos",
  "Cuidado Capilar",
  "Tratamiento",
  "Manicura",
  "Styling",
];

const allProducts: Product[] = [
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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

  const columns = [
    {
      header: "Producto",
      accessorKey: (row: Product) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-white/80 border border-white overflow-hidden flex-shrink-0 shadow-2xs">
            <Image src={row.img} alt={row.name} fill className="object-cover" />
          </div>
          <span className="font-bold text-[#32130E]">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Categoría",
      accessorKey: (row: Product) => (
        <span className="text-[11px] font-bold text-[#32130E] bg-white/80 px-2.5 py-1 rounded-xl border border-white">
          {row.category}
        </span>
      ),
    },
    {
      header: "Precio",
      accessorKey: (row: Product) => (
        <span className="font-bold text-[#2E6F40] bg-white/80 px-2.5 py-1 rounded-xl border border-white">
          ${row.price.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: (row: Product) => (
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            row.inStock
              ? "bg-[#2E6F40]/10 text-[#2E6F40] border border-[#2E6F40]/20"
              : "bg-[#B83A3A]/10 text-[#B83A3A] border border-[#B83A3A]/20"
          }`}
        >
          {row.inStock ? "Disponible" : "Agotado"}
        </span>
      ),
    },
    {
      header: "Acción",
      accessorKey: (row: Product) => {
        const isAdded = addedItems.includes(row.id);
        return (
          <Button
            size="sm"
            variant={isAdded ? "secondary" : "primary"}
            disabled={!row.inStock}
            onClick={() => handleAddToCart(row.id)}
            className="gap-1.5"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Añadido
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />{" "}
                {row.inStock ? "Añadir" : "Agotado"}
              </>
            )}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen">
      <PageTitle
        title="Boutique & Productos Exclusivos"
        subtitle="Fórmulas profesionales seleccionadas para el cuidado, salud y brillo de tus clientes."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A5C55]" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white/50 border border-white/90 rounded-2xl text-[#32130E] placeholder-[#7A5C55] focus:outline-none focus:bg-white/80 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center bg-white/50 p-1 rounded-2xl border border-white/90 shadow-xs flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "bg-[#32130E] text-[#F5EBE1] shadow-xs"
                  : "text-[#7A5C55] hover:text-[#32130E]"
              }`}
              title="Vista Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl transition-all ${
                viewMode === "table"
                  ? "bg-[#32130E] text-[#F5EBE1] shadow-xs"
                  : "text-[#7A5C55] hover:text-[#32130E]"
              }`}
              title="Vista Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isAdded = addedItems.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-5 shadow-[0_8px_30px_rgba(50,19,14,0.05)] hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(50,19,14,0.08)] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-56 w-full bg-white/60 rounded-2xl mb-4 overflow-hidden border border-white">
                      <Image
                        src={product.img}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-[#32130E]/90 backdrop-blur-md text-[#F5EBE1] text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                          {product.badge === "Más Vendido" && (
                            <Sparkles className="w-3 h-3 text-amber-300" />
                          )}
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#32130E] bg-white/80 px-2.5 py-0.5 rounded-lg inline-block border border-white">
                        {product.category}
                      </span>
                      <h3 className="font-serif font-bold text-[#32130E] text-base leading-snug">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold ml-1 text-[#32130E]">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-[#7A5C55]">
                          ({product.reviews} opiniones)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#32130E]/10 flex items-center justify-between">
                    <span className="font-serif font-extrabold text-2xl text-[#32130E]">
                      ${product.price.toFixed(2)}
                    </span>

                    <Button
                      size="md"
                      variant={isAdded ? "secondary" : "primary"}
                      disabled={!product.inStock}
                      onClick={() => handleAddToCart(product.id)}
                      className="gap-2"
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
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-white">
            <p className="text-[#7A5C55] text-xs font-semibold">
              No se encontraron productos en esta categoría.
            </p>
          </div>
        )
      ) : (
        <DataTable columns={columns} data={filteredProducts} pageSize={6} />
      )}
    </div>
  );
}
