export const formatCurrency = (amount: number, currency: "KZT" | "USD" = "KZT") =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency === "KZT" ? "KZT" : "USD",
    maximumFractionDigits: 0
  }).format(amount);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));

export const buildQuery = (params: Record<string, string | number | boolean | string[] | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      return;
    }

    searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });

  return searchParams.toString();
};
