import { FormEvent, useEffect, useState } from "react";
import { fetchAddressSuggestions, has2GisApiKey } from "../../lib/2gis";
import type { AddressSuggestion } from "../../types/domain";
import { useSearchStore } from "../../store/searchStore";

const districtOptions = {
  Астана: ["Есиль", "Алматинский", "Сарыарка", "Нура", "Сарайшык", "Байконур"],
  Алматы: [
    "Бостандыкский",
    "Медеуский",
    "Алмалинский",
    "Ауэзовский",
    "Алатауский",
    "Наурызбайский",
    "Турксибский",
    "Жетысуский"
  ]
} as const;
const allDistricts = [...districtOptions.Астана, ...districtOptions.Алматы];

const buildingTypes = ["Монолит", "Панель", "Кирпич", "Блок"];
const conditions = ["Без ремонта", "Косметический", "Евроремонт", "Дизайнерский", "Чистовая отделка"];
const rooms = ["1", "2", "3", "4", "5+", "Студия"];
const marketTypes = ["Первичный", "Вторичный"];

export function FilterSidebar() {
  const filters = useSearchStore((state) => state.filters);
  const setFilters = useSearchStore((state) => state.setFilters);
  const resetFilters = useSearchStore((state) => state.resetFilters);
  const hasPrecise2gisRouting = has2GisApiKey();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (filters.workAddress.trim().length < 3) {
      setSuggestions([]);
      setSuggestionsError(null);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);
    setSuggestionsError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const items = await fetchAddressSuggestions(filters.workAddress, filters.city);
        if (!cancelled) {
          setSuggestions(items);
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([]);
          setSuggestionsError(error instanceof Error ? error.message : "Не удалось загрузить адреса");
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [filters.workAddress, filters.city]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-card lg:sticky lg:top-24 lg:self-start"
    >
      <div>
        <p className="text-sm font-semibold text-slate-500">Локация и сделка</p>
        <div className="mt-3 grid gap-3">
          <select
            className="rounded-2xl border border-slate-200 px-4 py-3"
            value={filters.city}
            onChange={(event) =>
              setFilters({ city: event.target.value as typeof filters.city, district: [] })
            }
          >
            <option value="all">Все города</option>
            <option value="Астана">Астана</option>
            <option value="Алматы">Алматы</option>
          </select>
          <select
            className="rounded-2xl border border-slate-200 px-4 py-3"
            value={filters.operation}
            onChange={(event) =>
              setFilters({ operation: event.target.value as typeof filters.operation })
            }
          >
            <option value="all">Все операции</option>
            <option value="sale">Продажа</option>
            <option value="rent_long">Аренда долгосрочная</option>
            <option value="rent_daily">Посуточная</option>
          </select>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-500">Районы</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(filters.city === "all" ? allDistricts : districtOptions[filters.city]).map((district) => {
            const active = filters.district.includes(district);
            return (
              <button
                key={district}
                type="button"
                className={`rounded-full px-3 py-2 text-sm ${
                  active ? "bg-navy text-white" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() =>
                  setFilters({
                    district: active
                      ? filters.district.filter((item) => item !== district)
                      : [...filters.district, district]
                  })
                }
              >
                {district}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-500">
          Мин. цена
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={filters.minPrice ?? ""}
            onChange={(event) => setFilters({ minPrice: Number(event.target.value) || undefined })}
          />
        </label>
        <label className="text-sm text-slate-500">
          Макс. цена
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={filters.maxPrice ?? ""}
            onChange={(event) => setFilters({ maxPrice: Number(event.target.value) || undefined })}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-500">
          Площадь от
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={filters.minArea ?? ""}
            onChange={(event) => setFilters({ minArea: Number(event.target.value) || undefined })}
          />
        </label>
        <label className="text-sm text-slate-500">
          Площадь до
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={filters.maxArea ?? ""}
            onChange={(event) => setFilters({ maxArea: Number(event.target.value) || undefined })}
          />
        </label>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-500">Тип рынка</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {marketTypes.map((marketType) => {
            const active = filters.marketType === marketType;
            return (
              <button
                key={marketType}
                type="button"
                className={`rounded-full px-3 py-2 text-sm ${
                  active ? "bg-navy text-white" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() => setFilters({ marketType: active ? undefined : marketType })}
              >
                {marketType}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-500">Комнаты</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {rooms.map((room) => {
            const active = filters.rooms.includes(room);
            return (
              <button
                key={room}
                type="button"
                className={`rounded-full px-3 py-2 text-sm ${
                  active ? "bg-amber text-ink" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() =>
                  setFilters({
                    rooms: active
                      ? filters.rooms.filter((item) => item !== room)
                      : [...filters.rooms, room]
                  })
                }
              >
                {room}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-500">Тип постройки</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {buildingTypes.map((type) => {
            const active = filters.buildingType.includes(type);
            return (
              <button
                key={type}
                type="button"
                className={`rounded-full px-3 py-2 text-sm ${
                  active ? "bg-sand text-navy" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() =>
                  setFilters({
                    buildingType: active
                      ? filters.buildingType.filter((item) => item !== type)
                      : [...filters.buildingType, type]
                  })
                }
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-500">Состояние</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {conditions.map((condition) => {
            const active = filters.condition.includes(condition);
            return (
              <button
                key={condition}
                type="button"
                className={`rounded-full px-3 py-2 text-sm ${
                  active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
                onClick={() =>
                  setFilters({
                    condition: active
                      ? filters.condition.filter((item) => item !== condition)
                      : [...filters.condition, condition]
                  })
                }
              >
                {condition}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filters.notFirstFloor}
            onChange={(event) => setFilters({ notFirstFloor: event.target.checked })}
          />
          Не первый этаж
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filters.notLastFloor}
            onChange={(event) => setFilters({ notLastFloor: event.target.checked })}
          />
          Не последний этаж
        </label>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-500">Время до работы</p>
        <div className="mt-3 space-y-3">
          <label className="block text-sm text-slate-500">
            Место работы
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Например, Аль-Фараби 17, Алматы"
              value={filters.workAddress}
              onChange={(event) =>
                setFilters({
                  workAddress: event.target.value,
                  workLocation: null
                })
              }
            />
          </label>

          {!hasPrecise2gisRouting ? (
            <p className="text-sm text-amber-700">
              Без 2GIS-ключа режимы `На машине` и `Пешком` считаются через OSRM, а
              `Общественный транспорт` пока работает в приблизительном режиме.
            </p>
          ) : null}

          {filters.workAddress.trim().length >= 3 ? (
            <div className="rounded-2xl border border-slate-200 bg-white">
              {suggestionsLoading ? (
                <p className="px-4 py-3 text-sm text-slate-500">Ищем адреса…</p>
              ) : null}
              {!suggestionsLoading && suggestions.length ? (
                <div className="max-h-52 overflow-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.location.lon}-${suggestion.location.lat}`}
                      type="button"
                      className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 last:border-b-0 hover:bg-slate-50"
                      onClick={() =>
                        setFilters({
                          workAddress: suggestion.label,
                          workLocation: suggestion.location
                        })
                      }
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {!suggestionsLoading && suggestionsError ? (
                <p className="px-4 py-3 text-sm text-red-600">{suggestionsError}</p>
              ) : null}
            </div>
          ) : null}

          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={filters.travelMode}
            onChange={(event) =>
              setFilters({ travelMode: event.target.value as typeof filters.travelMode })
            }
          >
            <option value="driving">🚗 На машине</option>
            <option value="public_transport">🚌 На общественном транспорте</option>
            <option value="walking">🚶 Пешком</option>
          </select>

          <label className="block text-sm text-slate-500">
            Время в пути, минут
            <input
              type="number"
              min="1"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="до 30 минут"
              value={filters.maxTravelMinutes ?? ""}
              onChange={(event) =>
                setFilters({
                  maxTravelMinutes: Number(event.target.value) || undefined
                })
              }
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
        onClick={resetFilters}
      >
        Сбросить фильтры
      </button>
    </form>
  );
}
