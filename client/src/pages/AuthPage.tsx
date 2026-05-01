import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password: string) => {
  if (password.length < 8) return "Минимум 8 символов";
  if (!/[A-Z]/.test(password)) return "Нужна хотя бы одна заглавная буква";
  if (!/[0-9]/.test(password)) return "Нужна хотя бы одна цифра";
  return null;
};

export function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Введите корректный email");
      return;
    }

    if (mode === "register") {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
      if (name.trim().length < 2) {
        setError("Введите имя (минимум 2 символа)");
        return;
      }
    }

    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await api.login(email, password)
          : await api.register({ email, name: name.trim(), password });

      setAuth(result);
      navigate("/dashboard");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error ? submissionError.message : "Ошибка авторизации";
      setError(message.includes("401") ? "Неверный email или пароль" : message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
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
            Вход и регистрация работают по email и паролю. Пароль должен содержать минимум 8
            символов, заглавную букву и цифру.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <div className="inline-flex rounded-full bg-slate-200 p-1">
            <button
              className={`rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-white" : ""}`}
              onClick={() => switchMode("login")}
              type="button"
            >
              Вход
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm ${mode === "register" ? "bg-white" : ""}`}
              onClick={() => switchMode("register")}
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

            {mode === "register" ? (
              <label className="block text-sm text-slate-500">
                Подтвердите пароль
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            ) : null}

            {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

            <Button className="w-full" disabled={loading}>
              {loading ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
