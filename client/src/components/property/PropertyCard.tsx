import { Link } from "react-router-dom";
import type { Property } from "../../types/domain";
import { formatCurrency, formatDate, formatNumber } from "../../lib/utils";
import { Button } from "../ui/Button";
import { FavoriteButton } from "./FavoriteButton";

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const visibleFeatures = compact ? property.features.slice(0, 2) : property.features;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-card transition hover:-translate-y-1">
      <div className="relative">
        <img
          className={`${compact ? "h-36" : "h-56"} w-full object-cover`}
          src={property.images[0]}
          alt={property.title}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {property.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className={`${compact ? "space-y-3 p-4" : "space-y-4 p-5"}`}>
        <div className={`${compact ? "space-y-2" : "flex items-start justify-between gap-4"}`}>
          <div>
            <p className="text-sm text-slate-500">
              {property.city} · {property.district}
            </p>
            <h3 className={`${compact ? "line-clamp-2 text-lg" : "text-xl"} mt-1 font-heading font-bold text-ink`}>
              {property.title}
            </h3>
          </div>
          <div className={compact ? "" : "text-right"}>
            <p className={`${compact ? "text-xl" : "text-2xl"} font-heading font-extrabold text-ink`}>
              {formatCurrency(property.price, property.currency)}
            </p>
            <p className="text-sm text-slate-500">{formatNumber(property.pricePerSqm)} ₸/м²</p>
          </div>
        </div>

        <div className={`${compact ? "gap-2 rounded-2xl p-3 text-xs" : "gap-3 rounded-3xl p-4 text-sm sm:grid-cols-4"} grid grid-cols-2 bg-slate-50`}>
          <div>
            <p className="text-slate-500">Комнат</p>
            <p className="font-semibold">{property.rooms ?? "n/a"}</p>
          </div>
          <div>
            <p className="text-slate-500">Площадь</p>
            <p className="font-semibold">{formatNumber(property.areaTotal)} м²</p>
          </div>
          <div>
            <p className="text-slate-500">Этаж</p>
            <p className="font-semibold">
              {property.floor}/{property.floorsTotal}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Год</p>
            <p className="font-semibold">{property.yearBuilt ?? "n/a"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleFeatures.map((feature) => (
            <span key={feature} className="rounded-full bg-sand px-3 py-1 text-xs text-navy">
              {feature}
            </span>
          ))}
        </div>

        <div className={`${compact ? "space-y-3" : "flex items-center justify-between gap-3"}`}>
          <div className="text-sm text-slate-500">
            <p>{property.address}</p>
            <p className={`${compact ? "hidden" : "mt-1"}`}>
              Опубликовано {formatDate(property.publishedAt)} · Источник {property.sourceName}
            </p>
          </div>
          <div className={`${compact ? "grid grid-cols-[auto_1fr_1fr] gap-2" : "flex gap-3"}`}>
            <FavoriteButton propertyId={property.id} />
            <Link to={`/properties/${property.id}`} className="contents">
              <Button variant="secondary" className={compact ? "px-3 py-2" : undefined}>
                Карточка
              </Button>
            </Link>
            <Link to={`/reports/${property.id}`} className="contents">
              <Button className={compact ? "px-3 py-2" : undefined}>Отчёт</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
