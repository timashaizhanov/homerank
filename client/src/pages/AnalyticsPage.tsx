import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../lib/api";
import { formatNumber } from "../lib/utils";

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["market-analytics"],
    queryFn: api.getAnalytics
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12">Загружаем аналитику рынка...</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Лидогенерация и рынок</p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-ink">Публичная аналитика по районам</h1>
        <p className="mt-4 text-lg text-slate-600">
          Этот экран показывает часть рыночных метрик бесплатно и подводит к покупке детальных
          отчётов по конкретным объектам.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {data?.districts.map((district) => (
          <div key={`${district.city}-${district.district}`} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {district.city} · {district.district}
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-ink">
                  {formatNumber(district.avgPriceSqm)} ₸/м²
                </h2>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-sm text-slate-500">Спрос</p>
                <p className="text-xl font-bold text-navy">{district.demandIndex}</p>
              </div>
            </div>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={district.trend}>
                  <defs>
                    <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a017" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#d4a017" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#102a43" fill="url(#priceFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="font-heading text-2xl font-bold text-ink">Топ инвестиционных возможностей</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data?.topOpportunities.map((item) => (
            <div key={item.id} className="rounded-3xl bg-slate-50 p-4">
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {item.city} · {item.district}
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Yield {item.rentYield}% · ROI 3 года {item.roi3y}% · Ликвидность {item.liquidity}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
