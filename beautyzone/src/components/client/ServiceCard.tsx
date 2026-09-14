import Image from "next/image";
import Link from "next/link";
import { Scissors, Clock, Sparkles, Calendar } from "lucide-react";

export interface Service {
  id: number;
  name: string;
  category: string;
  duration: string;
  price: string;
  img: string;
  description?: string;
  popular?: boolean;
}

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="min-w-[280px] md:min-w-[320px] bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow snap-start flex flex-col justify-between">
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
          {service.popular && (
            <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Popular
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{service.duration}</span>
          </div>
          <h3 className="font-semibold text-stone-900 text-lg leading-snug">
            {service.name}
          </h3>
          {service.description && (
            <p className="text-stone-500 text-xs mt-2 line-clamp-2">
              {service.description}
            </p>
          )}
        </div>
      </div>
      <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-2">
        <span className="font-serif font-bold text-xl text-stone-900">
          {service.price}
        </span>
        <Link
          href={`/reservas?servicio=${service.id}`}
          className="px-4 py-2 bg-stone-900 hover:bg-rose-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" /> Agendar
        </Link>
      </div>
    </div>
  );
}
