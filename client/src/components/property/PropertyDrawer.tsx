import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { Property } from "../../types/domain";
import { getSafetyProfile } from "../../lib/safety";
import { formatCurrency, formatDate, formatNumber } from "../../lib/utils";
import { Button } from "../ui/Button";
import { FavoriteButton } from "./FavoriteButton";

interface PropertyDrawerProps {
  property: Property | null;
  onClose: () => void;
}

export function PropertyDrawer({ property, onClose }: PropertyDrawerProps) {
  useEffect(() => {
    if (!property) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, property]);

  if (!property) {
    return null;
  }

  const safety = getSafetyProfile(property);
  const details = Object.entries(property.details).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Закрыть карточку"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:w-[86vw] lg:w-1/2 xl:max-w-[760px]"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Карточка объекта</p>
            <p className="mt-1 text-sm text-slate-500">
              {property.city} · {property.district}
            </p>
          </div>
          <button
            aria-label="Закрыть"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="grid gap-4 p-5">
            <img
              alt={property.title}
              className="h-64 w-full rounded-3xl object-cover"
              src={property.images[0]}
            />

            <div>
              <div className="flex flex-wrap gap-2">
                {property.badges.map((badge) => (
                  <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink">
                    {badge}
                  </span>
                ))}
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${safety.badgeClassName}`}>
                  Среда района: {safety.label}
                </span>
              </div>
              <h2 className="mt-3 font-heading text-3xl font-bold text-ink">{property.title}</h2>
              <p className="mt-2 text-slate-600">{property.address}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Цена</p>
                <p className="mt-1 font-heading text-2xl font-extrabold text-ink">
                  {formatCurrency(property.price, property.currency)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{formatNumber(property.pricePerSqm)} ₸/м²</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Параметры</p>
                <p className="mt-1 font-semibold text-ink">
                  {property.rooms ?? "n/a"} комн. · {formatNumber(property.areaTotal)} м²
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Этаж {property.floor}/{property.floorsTotal} · {property.yearBuilt ?? "n/a"} г.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Инфраструктура</p>
                <p className="mt-2 text-2xl font-bold text-navy">{property.districtScore}/10</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Доходность</p>
                <p className="mt-2 text-2xl font-bold text-navy">{property.analytics.rentYield}%</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">ROI 3 года</p>
                <p className="mt-2 text-2xl font-bold text-navy">{property.analytics.roi3y}%</p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-semibold text-ink">Описание</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{property.description}</p>
              <p className="mt-3 text-sm text-slate-500">
                Опубликовано {formatDate(property.publishedAt)} · Источник {property.sourceName}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="font-semibold text-ink">Детали</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {details.map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                    <p className="text-slate-500">{key}</p>
                    <p className="mt-1 font-semibold text-ink">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr]">
            <FavoriteButton propertyId={property.id} />
            <Link to={`/properties/${property.id}`} className="contents">
              <Button variant="secondary" className="w-full">Полная карточка</Button>
            </Link>
            <Link to={`/reports/${property.id}`} className="contents">
              <Button className="w-full">Открыть отчёт</Button>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
