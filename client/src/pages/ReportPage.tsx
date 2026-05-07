import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { formatCurrency, formatNumber } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { usePurchasesStore } from "../store/purchasesStore";

function Locked({ children, label = "Доступно после покупки" }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative select-none overflow-hidden rounded-xl">
      <div className="pointer-events-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-[2px]">
        <span className="text-lg">🔒</span>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
    </div>
  );
}

export function ReportPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const purchaseReport = usePurchasesStore((state) => state.purchaseReport);
  const isPurchased = usePurchasesStore((state) => (params.id ? state.hasReport(params.id) : false));

  const propertyQuery = useQuery({
    queryKey: ["property", params.id],
    queryFn: () => api.getProperty(params.id ?? ""),
    enabled: Boolean(params.id)
  });
  const reportQuery = useQuery({
    queryKey: ["report", params.id],
    queryFn: () => api.getReport(params.id ?? ""),
    enabled: Boolean(params.id)
  });

  const property = propertyQuery.data;
  const coords = property?.coordinates;

  const solarQuery = useQuery({
    queryKey: ["solar", coords?.[1], coords?.[0]],
    queryFn: () => api.getSolarData(coords![1], coords![0], property?.city),
    enabled: Boolean(coords),
    retry: false
  });
  const climateQuery = useQuery({
    queryKey: ["climate", coords?.[1], coords?.[0]],
    queryFn: () => api.getClimateData(coords![1], coords![0]),
    enabled: Boolean(coords),
    retry: false
  });
  const greeneryQuery = useQuery({
    queryKey: ["greenery", coords?.[1], coords?.[0]],
    queryFn: () => api.getGreeneryData(coords![1], coords![0]),
    enabled: Boolean(coords),
    retry: false
  });
  const marketPricesQuery = useQuery({
    queryKey: ["market-prices", property?.city],
    queryFn: () => api.getMarketPrices(property!.city),
    enabled: Boolean(property?.city),
    retry: false
  });
  const developerQuery = useQuery({
    queryKey: ["developer", property?.address, property?.city],
    queryFn: () => api.getDeveloperInfo(property!.address, property!.city),
    enabled: Boolean(property?.address && property?.city),
    retry: false
  });

  if (propertyQuery.isLoading || reportQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Формируем отчёт...</p>
      </div>
    );
  }

  const report = reportQuery.data;

  if (!property || !report) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Отчёт недоступен.</p>
      </div>
    );
  }

  const handlePurchase = () => {
    purchaseReport({ propertyId: property.id, title: property.title, amountKzt: report.amountKzt });
  };

  const marketPrice = marketPricesQuery.data;
  const priceVsMarket =
    marketPrice?.avgPricePerSqmKzt
      ? Math.round(((property.pricePerSqm - marketPrice.avgPricePerSqmKzt) / marketPrice.avgPricePerSqmKzt) * 100)
      : null;

  const trendData = isPurchased ? property.analytics.priceTrend12m : property.analytics.priceTrend6m;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="rounded-[2rem] bg-ink p-8 text-white shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber/70">Полный отчёт</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-extrabold leading-tight">{property.title}</h1>
            <p className="mt-1 text-slate-400">
              {property.city} · {isPurchased ? property.address : `${property.district}, точный адрес скрыт`}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/10 px-5 py-3 text-right">
            <p className="text-xs text-slate-400">{isPurchased ? "Статус" : "Разовый платёж"}</p>
            <p className="mt-0.5 text-xl font-bold text-amber">
              {isPurchased ? "Куплено ✓" : formatCurrency(report.amountKzt)}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Цена", value: formatCurrency(property.price) },
            { label: "Цена/м²", value: `${formatNumber(property.pricePerSqm)} ₸` },
            { label: "Площадь", value: `${formatNumber(property.areaTotal)} м²` },
            { label: "Год постройки", value: property.yearBuilt ?? "—" }
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/8 px-4 py-3">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-0.5 font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Auth / Purchase CTA ───────────────────────────────── */}
      {!user ? (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-amber/30 bg-amber/5 px-6 py-4">
          <p className="text-sm text-slate-600">Войдите, чтобы купить отчёт и сохранить в кабинете.</p>
          <Link to="/auth">
            <Button>Войти</Button>
          </Link>
        </div>
      ) : null}

      {user && !isPurchased ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink px-6 py-5 text-white shadow-card">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber/70">Pay per report</p>
            <p className="mt-1 font-heading text-xl font-bold">Полный отчёт скрыт до покупки</p>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Откроется точный адрес, юридический блок, контакты продавца и расширенная аналитика.
            </p>
          </div>
          <Button onClick={handlePurchase}>Оплатить {formatCurrency(report.amountKzt)}</Button>
        </div>
      ) : null}

      {/* ── Investment + Legal (2-col) ────────────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Investment */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-heading text-xl font-bold text-ink">Инвестиционный анализ</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Gross Yield", value: `${report.investment.rentYield}%` },
              { label: "Cap Rate", value: `${report.investment.capRate}%` },
              { label: "ROI 3 года", value: `${report.investment.roiForecast["3y"]}%` }
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-bold text-navy">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {isPurchased ? (
              <>
                <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">ROI 1 год</span>
                  <span className="font-semibold text-ink">{report.investment.roiForecast["1y"]}%</span>
                </div>
                <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">ROI 5 лет</span>
                  <span className="font-semibold text-ink">{report.investment.roiForecast["5y"]}%</span>
                </div>
              </>
            ) : (
              <Locked>
                <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">ROI 1 год</span>
                  <span className="font-semibold text-ink">{report.investment.roiForecast["1y"]}%</span>
                </div>
                <div className="mt-2 flex justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">ROI 5 лет</span>
                  <span className="font-semibold text-ink">{report.investment.roiForecast["5y"]}%</span>
                </div>
              </Locked>
            )}
          </div>
          {isPurchased ? (
            <p className="mt-4 text-sm text-slate-500">{report.investment.depositComparison}</p>
          ) : (
            <Locked label="Сравнение с депозитом после покупки">
              <p className="mt-4 text-sm text-slate-400">{report.investment.depositComparison}</p>
            </Locked>
          )}
        </div>

        {/* Legal */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-heading text-xl font-bold text-ink">Юридический блок</h2>
          <div className="mt-4 space-y-2 text-sm">
            {[
              { label: "История владения", value: report.legal.ownershipHistory },
              { label: "Обременения", value: report.legal.encumbrances },
              { label: "Залог", value: report.legal.pledgeCheck },
              { label: "Тип документа", value: report.legal.documentType }
            ].map(({ label, value }) => (
              isPurchased ? (
                <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 text-slate-700">{value}</div>
              ) : (
                <Locked key={label} label={label}>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-700">{value}</div>
                </Locked>
              )
            ))}
          </div>
        </div>
      </div>

      {/* ── Price trend (full width) ──────────────────────────── */}
      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink">Динамика цены</h2>
            <p className="text-sm text-slate-500">
              {isPurchased ? "12 месяцев" : "6 месяцев"} · цена за м² по сегменту
            </p>
          </div>
          {priceVsMarket !== null ? (
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${priceVsMarket > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
              {priceVsMarket > 0 ? "+" : ""}{priceVsMarket}% к рынку
            </span>
          ) : null}
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                width={65}
                tick={{ fontSize: 12 }}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}к`}
              />
              <Tooltip formatter={(v: number) => [`${formatNumber(v)} ₸/м²`, "Цена"]} />
              {marketPrice?.avgPricePerSqmKzt ? (
                <ReferenceLine
                  y={marketPrice.avgPricePerSqmKzt}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: "Ср. по городу", position: "insideTopRight", fontSize: 11, fill: "#94a3b8" }}
                />
              ) : null}
              <Line type="monotone" dataKey="value" stroke="#d4a017" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Comparables ──────────────────────────────────────── */}
      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">Аналоги в районе</h2>
          {isPurchased ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ликвидность: {report.market.liquidity} · {report.market.exposureDays} дней
            </span>
          ) : (
            <Locked label="Ликвидность после покупки">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Ликвидность: {report.market.liquidity} · {report.market.exposureDays} дней
              </span>
            </Locked>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {report.market.comparables.map((item, i) => (
            i === 0 || isPurchased ? (
              <Link
                key={item.id}
                to={`/properties/${item.id}`}
                className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-navy/20 hover:bg-white hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
              >
                <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-lg font-bold text-navy">{formatCurrency(item.price)}</p>
                <p className="text-xs text-slate-500">{formatNumber(item.pricePerSqm)} ₸/м² · {item.distanceKm} км</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy">Открыть карточку</p>
              </Link>
            ) : (
              <Locked key={item.id}>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-2 text-lg font-bold text-navy">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-slate-500">{formatNumber(item.pricePerSqm)} ₸/м² · {item.distanceKm} км</p>
                </div>
              </Locked>
            )
          ))}
        </div>
      </div>

      {/* ── Environment row (3 cards) ─────────────────────────── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {/* Market price */}
        {marketPrice ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Рынок города</p>
            <p className="mt-3 text-2xl font-bold text-ink">
              {marketPrice.avgPricePerSqmKzt ? `${formatNumber(marketPrice.avgPricePerSqmKzt)} ₸` : "—"}
            </p>
            <p className="text-sm text-slate-500">средняя цена/м²</p>
            {priceVsMarket !== null ? (
              <p className={`mt-3 text-sm font-semibold ${priceVsMarket > 0 ? "text-red-500" : "text-emerald-600"}`}>
                Этот объект {priceVsMarket > 0 ? "дороже" : "дешевле"} рынка на {Math.abs(priceVsMarket)}%
              </p>
            ) : null}
            <p className="mt-2 text-xs text-slate-400">
              {marketPrice.source === "numbeo" ? "Numbeo" : "внутренние данные"}
            </p>
          </div>
        ) : null}

        {/* Greenery */}
        {greeneryQuery.data ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Зелень района</p>
            <p className="mt-3 text-2xl font-bold text-emerald-600">{greeneryQuery.data.score}/10</p>
            <p className="text-sm text-slate-500">рейтинг озеленения</p>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Парков в 1 км</span>
                <span className="font-semibold text-ink">{greeneryQuery.data.parkCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Плотность деревьев</span>
                <span className="font-semibold text-ink capitalize">{greeneryQuery.data.treeDensity}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">OpenStreetMap · Overpass</p>
          </div>
        ) : null}

        {/* Developer */}
        {developerQuery.data && developerQuery.data.length > 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Застройщик</p>
            {developerQuery.data.slice(0, 1).map((dev, i) => (
              <div key={i}>
                <p className="mt-3 text-base font-bold text-ink">{dev.name}</p>
                {dev.rating ? (
                  <p className="mt-1 text-2xl font-bold text-navy">★ {dev.rating}</p>
                ) : null}
                {dev.reviewCount ? (
                  <p className="text-sm text-slate-500">{dev.reviewCount} отзывов</p>
                ) : null}
                {dev.phone ? (
                  <p className="mt-2 text-sm text-slate-600">{dev.phone}</p>
                ) : null}
              </div>
            ))}
            <p className="mt-2 text-xs text-slate-400">2GIS</p>
          </div>
        ) : null}
      </div>

      {/* ── Climate chart ────────────────────────────────────── */}
      {climateQuery.data && climateQuery.data.length > 0 ? (
        <div className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">Климат района</h2>
              <p className="text-sm text-slate-500">Средняя температура 2020–2024 · Open-Meteo</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-ink">
                {Math.max(...climateQuery.data.map((d) => d.avgTempC))}°C макс
              </p>
              <p className="text-slate-500">
                {Math.min(...climateQuery.data.map((d) => d.avgTempC))}°C мин
              </p>
            </div>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={climateQuery.data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis width={40} tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v}°`} />
                <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                <Tooltip formatter={(v: number) => [`${v} °C`, "Температура"]} />
                <Line
                  type="monotone"
                  dataKey="avgTempC"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* ── Solar chart ──────────────────────────────────────── */}
      {solarQuery.data && solarQuery.data.length > 0 ? (
        <div className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">Солнечная инсоляция</h2>
              <p className="text-sm text-slate-500">кВт·ч/м² в месяц · PVGIS EU JRC</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-ink">
                {solarQuery.data.reduce((a, b) => a + b.kwhPerM2, 0).toFixed(0)} кВт·ч/год
              </p>
              <p className="text-slate-500">суммарно на 1 м²</p>
            </div>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={solarQuery.data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis width={40} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} кВт·ч/м²`, "Инсоляция"]} />
                <Bar dataKey="kwhPerM2" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* ── Seller contacts ──────────────────────────────────── */}
      {report.seller ? (
        <div className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-heading text-xl font-bold text-ink">Контакты продавца</h2>
          {isPurchased ? (
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-slate-500">Имя</p>
                <p className="font-semibold text-ink">{report.seller.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Телефон</p>
                <p className="font-semibold text-ink">{report.seller.phone}</p>
              </div>
              {report.seller.agency ? (
                <div>
                  <p className="text-slate-500">Агентство</p>
                  <p className="font-semibold text-ink">{report.seller.agency}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <Locked label="Контакты после покупки">
              <div className="mt-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-slate-500">Имя</p>
                  <p className="font-semibold text-ink">{report.seller.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Телефон</p>
                  <p className="font-semibold text-ink">{report.seller.phone}</p>
                </div>
                {report.seller.agency ? (
                  <div>
                    <p className="text-slate-500">Агентство</p>
                    <p className="font-semibold text-ink">{report.seller.agency}</p>
                  </div>
                ) : null}
              </div>
            </Locked>
          )}
        </div>
      ) : null}

    </section>
  );
}
