import { useEffect, useState } from "react";
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
  const [displayedProperty, setDisplayedProperty] = useState<Property | null>(property);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (property) {
      setDisplayedProperty(property);
      const frame = window.requestAnimationFrame(() => setIsVisible(true));

      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timer = window.setTimeout(() => setDisplayedProperty(null), 280);

    return () => window.clearTimeout(timer);
  }, [property]);

  useEffect(() => {
    if (!displayedProperty) {
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
  }, [displayedProperty, onClose]);

  if (!displayedProperty) {
    return null;
  }

  const safety = getSafetyProfile(displayedProperty);
  const details = Object.entries(displayedProperty.details).slice(0, 8);
  const infrastructureCategories = Array.from(
    new Set(displayedProperty.infrastructure.map((item) => item.category))
  );
  const averageInfrastructureDistance =
    displayedProperty.infrastructure.length > 0
      ? displayedProperty.infrastructure.reduce((sum, item) => sum + item.distanceKm, 0) /
        displayedProperty.infrastructure.length
      : null;
  const houseFacts = [
    displayedProperty.yearBuilt ? { label: "Год постройки", value: `${displayedProperty.yearBuilt}` } : null,
    displayedProperty.buildingType ? { label: "Тип дома", value: displayedProperty.buildingType } : null,
    displayedProperty.floorsTotal ? { label: "Этажность", value: `${displayedProperty.floorsTotal} этажей` } : null,
    displayedProperty.condition ? { label: "Состояние", value: displayedProperty.condition } : null,
    displayedProperty.details.parking ? { label: "Паркинг", value: String(displayedProperty.details.parking) } : null,
    displayedProperty.details.elevator ? { label: "Лифт", value: String(displayedProperty.details.elevator) } : null,
    displayedProperty.details.security ? { label: "Безопасность дома", value: String(displayedProperty.details.security) } : null,
    displayedProperty.details.ceilingHeight
      ? { label: "Потолки", value: `${String(displayedProperty.details.ceilingHeight)} м` }
      : null
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Закрыть карточку"
        className={`absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none sm:w-[86vw] lg:w-1/2 xl:max-w-[760px] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Карточка объекта</p>
            <p className="mt-1 text-sm text-slate-500">
              {displayedProperty.city} · {displayedProperty.district}
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
              alt={displayedProperty.title}
              className="h-64 w-full rounded-3xl object-cover"
              src={displayedProperty.images[0]}
            />

            <div>
              <div className="flex flex-wrap gap-2">
                {displayedProperty.badges.map((badge) => (
                  <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink">
                    {badge}
                  </span>
                ))}
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${safety.badgeClassName}`}>
                  Среда района: {safety.label}
                </span>
              </div>
              <h2 className="mt-3 font-heading text-3xl font-bold text-ink">{displayedProperty.title}</h2>
              <p className="mt-2 text-slate-600">{displayedProperty.address}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Цена</p>
                <p className="mt-1 font-heading text-2xl font-extrabold text-ink">
                  {formatCurrency(displayedProperty.price, displayedProperty.currency)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{formatNumber(displayedProperty.pricePerSqm)} ₸/м²</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Параметры</p>
                <p className="mt-1 font-semibold text-ink">
                  {displayedProperty.rooms ?? "n/a"} комн. · {formatNumber(displayedProperty.areaTotal)} м²
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Этаж {displayedProperty.floor}/{displayedProperty.floorsTotal} · {displayedProperty.yearBuilt ?? "n/a"} г.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative rounded-3xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Инфраструктура</p>
                <div className="group absolute right-3 top-3">
                  <button
                    aria-label="Как считается рейтинг инфраструктуры"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-navy hover:text-navy focus:outline-none focus:ring-2 focus:ring-amber"
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 11v5" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                  <div className="pointer-events-none absolute right-0 top-9 z-10 w-72 rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600 opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100">
                    Рейтинг собирается из количества и близости объектов рядом с домом: транспорт,
                    школы, медицина, торговля и места для отдыха. Учитываются {displayedProperty.nearbyCount}{" "}
                    точек поблизости
                    {averageInfrastructureDistance
                      ? `, средняя дистанция ${formatNumber(averageInfrastructureDistance)} км`
                      : ""}
                    {displayedProperty.distanceToTransitKm
                      ? `, до транспорта ${formatNumber(displayedProperty.distanceToTransitKm)} км`
                      : ""}
                    .
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-navy">{displayedProperty.districtScore}/10</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Доходность</p>
                <p className="mt-2 text-2xl font-bold text-navy">{displayedProperty.analytics.rentYield}%</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">ROI 3 года</p>
                <p className="mt-2 text-2xl font-bold text-navy">{displayedProperty.analytics.roi3y}%</p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-semibold text-ink">Описание</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{displayedProperty.description}</p>
              {houseFacts.length ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-ink">О доме</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {houseFacts.map((fact) => (
                      <div key={fact.label} className="rounded-2xl bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">{fact.label}</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{fact.value}</p>
                      </div>
                    ))}
                  </div>
                  {infrastructureCategories.length ? (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Поблизости учитываются категории: {infrastructureCategories.slice(0, 5).join(", ")}.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="mt-3 text-sm text-slate-500">
                Опубликовано {formatDate(displayedProperty.publishedAt)} · Источник {displayedProperty.sourceName}
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
            <FavoriteButton propertyId={displayedProperty.id} />
            <Link to={`/properties/${displayedProperty.id}`} className="contents">
              <Button variant="secondary" className="w-full">Полная карточка</Button>
            </Link>
            <Link to={`/reports/${displayedProperty.id}`} className="contents">
              <Button className="w-full">Открыть отчёт</Button>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
