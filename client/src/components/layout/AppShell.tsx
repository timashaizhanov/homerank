import { Link, NavLink, Outlet } from "react-router-dom";
import { copy } from "../../data/copy";
import { useAuthStore } from "../../store/authStore";
import { useSearchStore } from "../../store/searchStore";
import { Button } from "../ui/Button";

function CabinetIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

export function AppShell() {
  const locale = useSearchStore((state) => state.locale);
  const toggleLocale = useSearchStore((state) => state.toggleLocale);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const text = copy[locale];

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-heading text-xl font-extrabold text-white">
            {text.brand}
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink className="text-sm text-slate-200 hover:text-white" to="/catalog">
              {text.nav[0]}
            </NavLink>
            <NavLink className="text-sm text-slate-200 hover:text-white" to="/analytics">
              {text.nav[1]}
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={toggleLocale}>
              {locale === "ru" ? "KZ" : "RU"}
            </Button>
            <Link
              aria-label="Личный кабинет"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              to={user ? "/dashboard" : "/auth"}
            >
              <CabinetIcon />
            </Link>
            {user ? (
              <Button variant="ghost" onClick={logout}>
                Выйти
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost">Войти</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
