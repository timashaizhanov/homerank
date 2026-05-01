import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { formatCurrency, formatNumber } from "../lib/utils";
import { ReportPreview } from "../components/property/ReportPreview";
import { FavoriteButton } from "../components/property/FavoriteButton";
import { Button } from "../components/ui/Button";

const DETAIL_KEY_LABELS: Record<string, string> = {
  balcony: "Балкон",
  parking: "Парковка",
  furniture: "Мебель",
  appliances: "Техника",
  internet: "Интернет",
  bathroomType: "Санузел",
  ceilingHeight: "Высота потолков",
  security: "Безопасность",
  elevator: "Лифт",
  view: "Вид из окна",
  utilitiesIncluded: "Коммунальные включены",
  sourceImported: "Источник",
  conditioner: "Кондиционер",
  heatingType: "Отопление",
  windowsType: "Окна",
  flooringType: "Покрытие пола",
  entranceDoor: "Входная дверь"
};

const detailKeyLabel = (key: string) =>
  DETAIL_KEY_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").toLowerCase();

const formatDetailValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (value === true) return "Да";
  if (value === false) return "Нет";
  if (typeof value === "number") return String(value);
  return String(value ?? "—");
};

export function PropertyPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["property", params.id],
    queryFn: () => api.getProperty(params.id ?? ""),
    enabled: Boolean(params.id)
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12">Загрузка карточки объекта...</div>;
  }

  if (!data) {
    return <div className="mx-auto max-w-7xl px-4 py-12">Объект не найден.</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {data.images.slice(0, 2).map((image) => (
              <img
                key={image}
                className="h-64 w-full rounded-[2rem] object-cover shadow-card"
                src={image}
                alt={data.title}
              />
            ))}
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <p className="text-sm text-slate-500">
              {data.city} · {data.district}
            </p>
            <h1 className="mt-2 font-heading text-4xl font-bold text-ink">{data.title}</h1>
            <p className="mt-4 text-lg text-slate-600">{data.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <FavoriteButton propertyId={data.id} />
              <Link to={`/reports/${data.id}`}>
                <Button>Перейти к отчёту</Button>
              </Link>
            </div>

            <div className="mt-6 grid gap-4 rounded-[2rem] bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-slate-500">Цена</p>
                <p className="font-bold text-ink">{formatCurrency(data.price)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Цена за м²</p>
                <p className="font-bold text-ink">{formatNumber(data.pricePerSqm)} ₸</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Площадь</p>
                <p className="font-bold text-ink">{formatNumber(data.areaTotal)} м²</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Транспорт</p>
                <p className="font-bold text-ink">{formatNumber(data.distanceToTransitKm)} км</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">Бесплатная аналитика</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Инфраструктура района</p>
                <p className="mt-2 text-2xl font-bold text-navy">{data.districtScore}/10</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Аналоги в радиусе 1 км</p>
                <p className="mt-2 text-2xl font-bold text-navy">{data.nearbyCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Потенциал аренды</p>
                <p className="mt-2 text-2xl font-bold text-navy">{data.analytics.rentYield}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ReportPreview property={data} />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">Что уже видно бесплатно</h2>
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              {Object.entries(data.details).slice(0, 6).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>{detailKeyLabel(key)}</span>
                  <span className="font-semibold text-ink">
                    {formatDetailValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
