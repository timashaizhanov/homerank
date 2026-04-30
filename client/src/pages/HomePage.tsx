import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { copy } from "../data/copy";
import { useSearchStore } from "../store/searchStore";
import { Button } from "../components/ui/Button";
import { PropertyCard } from "../components/property/PropertyCard";
import { StatCard } from "../components/ui/StatCard";

export function HomePage() {
  const locale = useSearchStore((state) => state.locale);
  const text = copy[locale];
  const { data } = useQuery({
    queryKey: ["home-properties", locale],
    queryFn: () =>
      api.getProperties({
        city: "Астана",
        operation: "sale",
        district: [],
        rooms: [],
        buildingType: [],
        condition: [],
        notFirstFloor: false,
        notLastFloor: false,
        workAddress: "",
        workLocation: null,
        travelMode: "driving"
      })
  });

  return (
    <div>
      <section className="bg-hero-grid text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <span className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              MVP для рынка Казахстана
            </span>
            <h1 className="mt-6 max-w-3xl font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
              {text.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">{text.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalog">
                <Button>{text.heroCtaPrimary}</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Средняя цена Есиль" value="552 000 ₸/м²" hint="данные за апрель 2026" />
            <StatCard label="Активные объявления" value="2 240" hint="Астана + Алматы" />
            <StatCard label="Доходность аренды" value="до 10.2%" hint="по ликвидным форматам" />
            <StatCard label="Цена отчёта" value="3 500 ₸" hint="разовая покупка по объекту" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Последние объекты</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-ink">Что сейчас в рынке</h2>
          </div>
          <Link className="text-sm font-semibold text-navy" to="/catalog">
            Перейти в каталог
          </Link>
        </div>
        <div className="mt-8 grid gap-6">
          {data?.items.slice(0, 2).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </div>
  );
}
