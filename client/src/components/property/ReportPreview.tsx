import { Link } from "react-router-dom";
import type { Property } from "../../types/domain";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { usePurchasesStore } from "../../store/purchasesStore";
import { Button } from "../ui/Button";

interface ReportPreviewProps {
  property: Property;
}

export function ReportPreview({ property }: ReportPreviewProps) {
  const user = useAuthStore((state) => state.user);
  const hasReport = usePurchasesStore((state) => state.hasReport(property.id));

  return (
    <div className="overflow-hidden rounded-[2rem] border border-amber/40 bg-ink text-white shadow-card">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber/80">Платный отчёт</p>
            <h3 className="mt-2 font-heading text-3xl font-bold">
              {hasReport
                ? "Отчёт уже куплен и доступен в кабинете"
                : `Полный анализ объекта за ${formatCurrency(3500)}`}
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Прогноз ROI 3 года</p>
              <p className="mt-2 text-2xl font-bold text-amber">{property.analytics.roi3y}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Количество аналогов</p>
              <p className="mt-2 text-2xl font-bold text-amber">{property.nearbyCount}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>Точный адрес, контакты продавца и расширенная юридическая проверка скрыты.</p>
            <p>
              В бесплатной версии сейчас видно только район, тренд 6 месяцев и базовая оценка
              инфраструктуры.
            </p>
          </div>
        </div>

        <div className="relative min-h-[320px] bg-white/5 p-6">
          <div className="absolute inset-0 backdrop-blur-[10px]" />
          <div className="relative z-10 rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-slate-300">Скрытые поля отчёта</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-3">История цены объявления</div>
              <div className="rounded-2xl bg-white/10 p-3">Топ-5 аналогов и ликвидность</div>
              <div className="rounded-2xl bg-white/10 p-3">Доходность аренды и сравнение с депозитом</div>
              <div className="rounded-2xl bg-white/10 p-3">
                Контакты продавца и точный адрес
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-300">
              Сейчас у объекта {formatNumber(property.areaTotal)} м² и доходность аренды до{" "}
              {property.analytics.rentYield}%.
            </p>
            <Link to={`/reports/${property.id}`} className="mt-5 block">
              <Button className="w-full">
                {hasReport ? "Открыть купленный отчёт" : user ? "Купить и открыть отчёт" : "Войти и открыть отчёт"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
