import type { Property } from "../types/domain";

export const CRIME_MAP_URL =
  "https://gis.kgp.kz/arcgis/apps/experiencebuilder/experience/?id=c048e1f975084dc1957108c00c9fb4d7&page=%D0%BA%D0%B0%D1%80%D1%82%D0%B0-%D0%BF%D1%80%D0%B5%D1%81%D1%82%D1%83%D0%BF%D0%BD%D0%BE%D1%81%D1%82%D0%B8";

const districtSafetyScores: Record<string, number> = {
  "Астана:Есиль": 84,
  "Астана:Нура": 82,
  "Астана:Сарайшык": 80,
  "Астана:Алматинский": 74,
  "Астана:Сарыарка": 70,
  "Астана:Байконур": 68,
  "Алматы:Бостандыкский": 83,
  "Алматы:Медеуский": 82,
  "Алматы:Алмалинский": 73,
  "Алматы:Ауэзовский": 69,
  "Алматы:Наурызбайский": 75,
  "Алматы:Алатауский": 67,
  "Алматы:Турксибский": 64,
  "Алматы:Жетысуский": 66
};

export const getSafetyScore = (property: Pick<Property, "city" | "district" | "districtScore">) =>
  districtSafetyScores[`${property.city}:${property.district}`] ??
  Math.max(58, Math.min(88, Math.round(property.districtScore * 8.7)));

export const getSafetyProfile = (property: Pick<Property, "city" | "district" | "districtScore">) => {
  const score = getSafetyScore(property);

  if (score >= 80) {
    return {
      score,
      label: "Спокойная",
      tone: "calm",
      textClassName: "text-teal-700",
      badgeClassName: "border-teal-200 bg-teal-50 text-teal-800",
      mapColor: "#14b8a6"
    } as const;
  }

  if (score >= 70) {
    return {
      score,
      label: "Сбалансированная",
      tone: "balanced",
      textClassName: "text-sky-700",
      badgeClassName: "border-sky-200 bg-sky-50 text-sky-800",
      mapColor: "#3b82f6"
    } as const;
  }

  return {
    score,
    label: "Оживлённая",
    tone: "active",
    textClassName: "text-amber-700",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
    mapColor: "#f59e0b"
  } as const;
};
