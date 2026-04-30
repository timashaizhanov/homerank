import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-ink">Страница не найдена</h1>
        <p className="mt-4 text-lg text-slate-600">
          Такого раздела нет или ссылка устарела. Каталог и аналитика доступны из верхнего меню.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/catalog">
            <Button>Открыть каталог</Button>
          </Link>
          <Link to="/analytics">
            <Button variant="secondary">Смотреть аналитику</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
