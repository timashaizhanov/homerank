import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, usesStaticApiMode } from "../lib/api";
import {
  fetchIsochrone,
  fetchOsrmDurations,
  geocodeAddress,
  has2GisApiKey,
  pointInMultiPolygon,
  supportsExactFallbackRouting
} from "../lib/2gis";
import { useSearchStore } from "../store/searchStore";
import { FilterSidebar } from "../components/property/FilterSidebar";
import { MapPanel } from "../components/map/MapPanel";
import { PropertyCard } from "../components/property/PropertyCard";
import { PropertyDrawer } from "../components/property/PropertyDrawer";
import type { Property } from "../types/domain";

export function CatalogPage() {
  const filters = useSearchStore((state) => state.filters);
  const viewMode = useSearchStore((state) => state.viewMode);
  const showSafetyLayer = useSearchStore((state) => state.showSafetyLayer);
  const setViewMode = useSearchStore((state) => state.setViewMode);
  const setFilters = useSearchStore((state) => state.setFilters);
  const [page, setPage] = useState(1);
  const [drawerProperty, setDrawerProperty] = useState<Property | null>(null);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
  const pageSize = 24;
  const quickSearches = [
    { label: "2 комн. в Есиле", query: "2 комн Есиль" },
    { label: "До 50 млн", query: "до 50 млн" },
    { label: "Монолит + паркинг", query: "монолит паркинг" },
    { label: "Рядом с транспортом", query: "остановка транспорт" },
    { label: "С ремонтом", query: "евроремонт" },
    { label: "Для инвестиций", query: "инвестиция roi доходность" }
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", filters, page, pageSize],
    queryFn: () => api.getProperties(filters, page, pageSize),
    placeholderData: (previousData) => previousData
  });
  const geocodeQuery = useQuery({
    queryKey: ["work-geocode", filters.workAddress, filters.city],
    queryFn: () => geocodeAddress(filters.workAddress, filters.city),
    enabled: !usesStaticApiMode && filters.workAddress.trim().length >= 3 && !filters.workLocation
  });
  const resolvedWorkLocation = filters.workLocation ?? geocodeQuery.data ?? null;
  const useExactFallbackRouting =
    !has2GisApiKey() &&
    Boolean(resolvedWorkLocation) &&
    Boolean(filters.maxTravelMinutes) &&
    supportsExactFallbackRouting(filters.travelMode);
  const isochroneQuery = useQuery({
    queryKey: ["work-isochrone", resolvedWorkLocation, filters.travelMode, filters.maxTravelMinutes],
    queryFn: () => fetchIsochrone(resolvedWorkLocation!, filters.travelMode, filters.maxTravelMinutes!),
    enabled:
      Boolean(resolvedWorkLocation) &&
      Boolean(filters.maxTravelMinutes) &&
      !usesStaticApiMode &&
      !useExactFallbackRouting
  });
  const durationQuery = useQuery({
    queryKey: [
      "work-durations",
      resolvedWorkLocation,
      filters.travelMode,
      filters.maxTravelMinutes,
      data?.items.map((item) => item.id).join("|")
    ],
    queryFn: () =>
      fetchOsrmDurations(
        resolvedWorkLocation!,
        (data?.items ?? []).map((item) => ({
          id: item.id,
          coordinates: item.coordinates
        })),
        filters.travelMode
      ),
    enabled: !usesStaticApiMode && useExactFallbackRouting && Boolean(data?.items.length)
  });
  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];

    if (usesStaticApiMode) {
      return items;
    }

    if (useExactFallbackRouting && filters.maxTravelMinutes) {
      const maxDurationSeconds = filters.maxTravelMinutes * 60;
      const durations = durationQuery.data ?? {};

      return items.filter((property) => {
        const durationSeconds = durations[property.id];
        return typeof durationSeconds === "number" && durationSeconds <= maxDurationSeconds;
      });
    }

    if (!isochroneQuery.data?.polygons.length) {
      return items;
    }

    return items.filter((property) =>
      pointInMultiPolygon(property.coordinates, isochroneQuery.data!.polygons)
    );
  }, [
    data?.items,
    durationQuery.data,
    filters.maxTravelMinutes,
    isochroneQuery.data,
    useExactFallbackRouting
  ]);
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Каталог</p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-ink">
            Поиск недвижимости по районам
          </h1>
        </div>
        <div className="inline-flex rounded-full bg-slate-200 p-1">
          <button
            className={`rounded-full px-4 py-2 text-sm ${viewMode === "list" ? "bg-white" : ""}`}
            onClick={() => setViewMode("list")}
          >
            Список
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm ${viewMode === "map" ? "bg-white" : ""}`}
            onClick={() => setViewMode("map")}
          >
            Карта
          </button>
        </div>
      </div>

      <div className="sticky top-3 z-30 mb-6 rounded-[1.5rem] border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative block">
            <span className="sr-only">Свободный поиск по каталогу</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              aria-label="Свободный поиск по каталогу"
              className={`h-11 rounded-full border border-slate-200 bg-slate-50 pl-11 text-sm font-semibold text-ink outline-none transition-all placeholder:text-slate-400 focus:border-navy focus:bg-white focus:ring-4 focus:ring-navy/10 ${
                isSmartSearchOpen || filters.searchQuery
                  ? "w-full pr-24 sm:w-[520px]"
                  : "w-[210px] pr-4"
              }`}
              onChange={(event) => {
                setFilters({ searchQuery: event.target.value });
                setIsSmartSearchOpen(true);
              }}
              onFocus={() => setIsSmartSearchOpen(true)}
              placeholder={
                isSmartSearchOpen || filters.searchQuery
                  ? "2 комнаты в Есиле, монолит с паркингом, до 50 млн"
                  : "Умный поиск"
              }
              type="search"
              value={filters.searchQuery}
            />
            {filters.searchQuery ? (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-navy hover:text-navy"
                onClick={() => setFilters({ searchQuery: "" })}
              >
                Очистить
              </button>
            ) : null}
          </div>
          {(isSmartSearchOpen || filters.searchQuery) ? (
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-navy hover:text-navy"
              onClick={() => setIsSmartSearchOpen(false)}
            >
              Свернуть
            </button>
          ) : (
            <span className="text-xs text-slate-500">Можно писать обычным текстом</span>
          )}
        </div>

        {(isSmartSearchOpen || filters.searchQuery) ? (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              Например: район, тип дома, ремонт, паркинг, цена или транспорт рядом.
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {quickSearches.map((item) => {
                const active = filters.searchQuery === item.query;

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-navy bg-navy text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-navy hover:text-navy"
                    }`}
                    onClick={() => {
                      setFilters({ searchQuery: item.query });
                      setIsSmartSearchOpen(true);
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterSidebar />
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">
              Найдено {totalItems} объектов. Сейчас показана страница {page} из {totalPages}
              {isochroneQuery.data?.polygons.length
                ? `, внутри зоны доступности на этой странице: ${filteredItems.length}.`
                : "."}{" "}
              Фильтры применяются в реальном времени.
            </p>
            {error instanceof Error ? (
              <p className="mt-2 text-sm text-red-600">
                Не удалось загрузить каталог: {error.message}
              </p>
            ) : null}
            {geocodeQuery.error instanceof Error ? (
              <p className="mt-2 text-sm text-red-600">
                Не удалось определить адрес места работы: {geocodeQuery.error.message}
              </p>
            ) : null}
            {isochroneQuery.error instanceof Error ? (
              <p className="mt-2 text-sm text-red-600">
                Не удалось построить зону по времени в пути: {isochroneQuery.error.message}
              </p>
            ) : null}
            {durationQuery.error instanceof Error ? (
              <p className="mt-2 text-sm text-red-600">
                Не удалось рассчитать время в пути через OSRM: {durationQuery.error.message}
              </p>
            ) : null}
            {isochroneQuery.isFetching ? (
              <p className="mt-2 text-sm text-slate-500">Считаем зону доступности от места работы…</p>
            ) : null}
            {durationQuery.isFetching ? (
              <p className="mt-2 text-sm text-slate-500">
                Считаем точное время в пути через OSRM для текущей страницы…
              </p>
            ) : null}
            {useExactFallbackRouting ? (
              <p className="mt-2 text-sm text-slate-500">
                Подбираем объекты с учётом выбранного времени в пути от указанного адреса.
              </p>
            ) : null}
          </div>
          {viewMode === "map" ? (
            <MapPanel
              properties={filteredItems}
              isochronePolygons={useExactFallbackRouting ? undefined : isochroneQuery.data?.polygons}
              isochroneSource={resolvedWorkLocation}
              showSafetyLayer={showSafetyLayer}
              onOpenDetails={setDrawerProperty}
            />
          ) : null}
          <div className="grid gap-4 xl:grid-cols-2">
            {isLoading ? <p>Загружаем объекты...</p> : null}
            {filteredItems.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                compact
                onOpenDetails={setDrawerProperty}
              />
            ))}
            {!isLoading && !filteredItems.length ? (
              <p className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">
                По текущим фильтрам на этой странице ничего не найдено. Попробуйте переключить
                страницу или ослабить фильтры.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">
              Страница {page} из {totalPages} · по {pageSize} объектов
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page <= 1}
              >
                Назад
              </button>
              <button
                type="button"
                className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={page >= totalPages}
              >
                Дальше
              </button>
            </div>
          </div>
        </div>
      </div>
      <PropertyDrawer property={drawerProperty} onClose={() => setDrawerProperty(null)} />
    </section>
  );
}
