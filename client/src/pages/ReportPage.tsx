import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { formatCurrency, formatNumber } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { usePurchasesStore } from "../store/purchasesStore";

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

  if (propertyQuery.isLoading || reportQuery.isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12">Формируем отчёт...</div>;
  }

  const property = propertyQuery.data;
  const report = reportQuery.data;

  if (!property || !report) {
    return <div className="mx-auto max-w-7xl px-4 py-12">Отчёт недоступен.</div>;
  }

  const handlePurchase = () => {
    purchaseReport({
      propertyId: property.id,
      title: property.title,
      amountKzt: report.amountKzt
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2.25rem] bg-ink p-8 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.2em] text-amber/80">Полный отчёт</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-extrabold">{property.title}</h1>
            <p className="mt-2 text-slate-300">
              {property.city}, {isPurchased ? property.address : `${property.district}, точный адрес скрыт`}
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 px-5 py-4">
            <p className="text-sm text-slate-300">{isPurchased ? "Статус" : "Разовый платёж"}</p>
            <p className="text-2xl font-bold text-amber">
              {isPurchased ? "Куплено" : formatCurrency(report.amountKzt)}
            </p>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="mt-8 rounded-[2rem] border border-amber/40 bg-amber/10 p-6">
          <p className="text-slate-700">
            Для покупки отчёта нужен вход в аккаунт. После оплаты отчёт сохранится в личном кабинете.
          </p>
          <Link className="mt-4 inline-block" to="/auth">
            <Button>Войти или зарегистрироваться</Button>
          </Link>
        </div>
      ) : null}

      {user && !isPurchased ? (
        <div className="mt-8 rounded-[2rem] border border-amber/40 bg-ink p-6 text-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-amber/80">Pay per report</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                Полный отчёт скрыт до покупки
              </h2>
              <p className="mt-2 max-w-3xl text-slate-300">
                После оплаты откроются точный адрес, юридический блок, контакты продавца,
                расширенная аналитика и объект появится в кабинете.
              </p>
            </div>
            <Button onClick={handlePurchase}>Оплатить {formatCurrency(report.amountKzt)}</Button>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">Инвестиционный анализ</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Gross Yield</p>
                <p className="mt-2 text-2xl font-bold text-navy">{report.investment.rentYield}%</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Cap Rate</p>
                <p className="mt-2 text-2xl font-bold text-navy">{report.investment.capRate}%</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">ROI 3 года</p>
                <p className="mt-2 text-2xl font-bold text-navy">
                  {report.investment.roiForecast["3y"]}%
                </p>
              </div>
            </div>
            <p className="mt-5 text-slate-600">
              {isPurchased
                ? report.investment.depositComparison
                : "Расширенное сравнение с депозитом доступно после покупки отчёта."}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-ink">Динамика цены</h2>
                <p className="text-sm text-slate-500">12 месяцев по сегменту и району</p>
              </div>
            </div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={isPurchased ? property.analytics.priceTrend12m : property.analytics.priceTrend6m}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#d4a017" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">Юридический блок</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {isPurchased ? (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4">{report.legal.ownershipHistory}</div>
                  <div className="rounded-2xl bg-slate-50 p-4">{report.legal.encumbrances}</div>
                  <div className="rounded-2xl bg-slate-50 p-4">{report.legal.pledgeCheck}</div>
                  <div className="rounded-2xl bg-slate-50 p-4">{report.legal.documentType}</div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4">История владения скрыта до покупки.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Проверка обременений скрыта до покупки.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Проверка на залог скрыта до покупки.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Тип документа скрыт до покупки.</div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-heading text-2xl font-bold text-ink">Топ аналоги</h2>
            <div className="mt-4 space-y-3">
              {(isPurchased ? report.market.comparables : report.market.comparables.slice(0, 1)).map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(item.price)} · {formatNumber(item.pricePerSqm)} ₸/м² ·{" "}
                    {item.distanceKm} км
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-amber/10 p-4 text-sm text-navy">
              {isPurchased
                ? `Ликвидность: ${report.market.liquidity}. Средний срок экспозиции ${report.market.exposureDays} дней.`
                : "Полная оценка ликвидности и расширенная таблица аналогов откроются после покупки."}
            </div>
          </div>

          {report.seller && isPurchased ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="font-heading text-2xl font-bold text-ink">Контакты продавца</h2>
              <p className="mt-4 text-slate-700">{report.seller.name}</p>
              <p className="text-slate-700">{report.seller.phone}</p>
              {report.seller.agency ? <p className="text-slate-500">{report.seller.agency}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
