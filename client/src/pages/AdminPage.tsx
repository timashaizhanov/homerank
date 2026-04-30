import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";

export function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: api.getAdminSummary
  });

  if (isLoading || !data) {
    return <div className="mx-auto max-w-7xl px-4 py-12">Загружаем admin-панель...</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-ink">
          Управление объявлениями, парсером и платежами
        </h1>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Объекты" value={String(data.totals.properties)} />
        <StatCard label="Активные парсеры" value={String(data.totals.activeParsers)} />
        <StatCard label="Оплаченные отчёты" value={String(data.totals.successfulPayments)} />
        <StatCard label="Выручка" value={formatCurrency(data.totals.reportRevenueKzt)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-heading text-2xl font-bold text-ink">Статус парсинга</h2>
          <div className="mt-4 space-y-4">
            {data.parserJobs.map((job) => (
              <div key={job.source} className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-ink">{job.source}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Статус: {job.status} · Получено {job.fetched} · Дедупликация {job.deduplicated}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-heading text-2xl font-bold text-ink">Очереди и cron</h2>
          <div className="mt-4 space-y-4">
            {data.queues.map((queue) => (
              <div key={queue.name} className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-ink">{queue.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Интервал: {queue.interval} · Следующий запуск: {queue.nextRun}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
