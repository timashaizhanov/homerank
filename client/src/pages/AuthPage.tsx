import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result =
        mode === "login"
          ? await api.login(email, password)
          : await api.register({ email, name, password });

      setAuth(result);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-ink p-8 text-white shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-amber/80">Auth</p>
          <h1 className="mt-3 font-heading text-4xl font-bold">
            Вход для кабинета, оплаты отчётов и сохранённых подборок
          </h1>
          <p className="mt-4 text-slate-300">
            Вход и регистрация работают по email и паролю. Админ-доступ выдаётся только заранее
            созданным админ-аккаунтам.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <div className="inline-flex rounded-full bg-slate-200 p-1">
            <button
              className={`rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-white" : ""}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Вход
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm ${mode === "register" ? "bg-white" : ""}`}
              onClick={() => setMode("register")}
              type="button"
            >
              Регистрация
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label className="block text-sm text-slate-500">
                Имя
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            ) : null}

            <label className="block text-sm text-slate-500">
              Email
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm text-slate-500">
              Пароль
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

            {mode === "login" ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Тестовый админ: <span className="font-semibold text-ink">admin@qala.kz</span> /{" "}
                <span className="font-semibold text-ink">Admin12345!</span>
              </div>
            ) : null}

            <Button className="w-full" disabled={loading}>
              {loading ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
