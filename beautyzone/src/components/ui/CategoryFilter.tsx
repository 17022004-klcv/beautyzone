interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide animate__animated animate__fadeIn">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === cat
              ? "bg-[#32130E] text-[#F5EBE1] shadow-md"
              : "bg-white/50 hover:bg-white/80 text-[#7A5C55] border border-white/90"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
