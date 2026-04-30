import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { useAuthStore } from "../store/authStore";
import { useFavoritesStore } from "../store/favoritesStore";
import { usePurchasesStore } from "../store/purchasesStore";
import { formatCurrency, formatDate } from "../lib/utils";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const purchases = usePurchasesStore((state) => state.records);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Личный кабинет</p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-ink">
          Купленные отчёты, избранное и уведомления
        </h1>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Купленных отчётов" value={String(purchases.length)} hint="доступны бессрочно" />
        <StatCard label="Избранных объектов" value={String(favoriteIds.length)} hint="синхронизировано локально" />
        <StatCard label="Уведомления" value="3" hint="по новым лотам в Есиле" />
      </div>

      {!user ? (
        <div className="mt-8 rounded-[2rem] border border-amber/40 bg-amber/10 p-6">
          <p className="text-sm text-navy">
            Сейчас это демо-кабинет. Для полного сценария входа авторизуйтесь через страницу входа.
          </p>
          <Link className="mt-4 inline-block" to="/auth">
            <Button>Открыть вход</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Текущий аккаунт</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink">{user.name}</h2>
          <p className="mt-2 text-slate-600">
            {user.email} · Роль: {user.role}
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-heading text-2xl font-bold text-ink">Последние отчёты</h2>
          <div className="mt-4 space-y-3">
            {purchases.length ? (
              purchases.map((item) => (
                <div key={item.propertyId} className="rounded-2xl bg-slate-50 p-4 text-slate-700">
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(item.amountKzt)} · {formatDate(item.purchasedAt)}
                  </p>
                  <Link className="mt-3 inline-block text-sm font-semibold text-navy" to={`/reports/${item.propertyId}`}>
                    Открыть отчёт
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">
                Пока нет купленных отчётов. Откройте любой объект и купите отчёт.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-heading text-2xl font-bold text-ink">Избранные объекты</h2>
          <div className="mt-4 space-y-3 text-slate-700">
            {favoriteIds.length ? (
              favoriteIds.map((id) => (
                <div key={id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-ink">{id}</p>
                  <Link className="mt-2 inline-block text-sm font-semibold text-navy" to={`/properties/${id}`}>
                    Открыть карточку
                  </Link>
                </div>
              ))
            ) : (
              <>
                <p>Пока нет избранных объектов.</p>
                <p>Добавьте лоты из каталога или со страницы объекта.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
