const PVGIS_BASE = "https://re.jrc.ec.europa.eu/api/v5_2/PVcalc";
const OPEN_METEO_BASE = "https://archive-api.open-meteo.com/v1/archive";
const OVERPASS_BASE = "https://overpass-api.de/api/interpreter";
const NUMBEO_BASE = "https://www.numbeo.com/api/city_prices";

export interface SolarMonth {
  month: string;
  kwhPerM2: number;
}

export interface ClimateMonth {
  month: string;
  avgTempC: number;
}

export interface GreeneryResult {
  score: number;
  parkCount: number;
  treeDensity: "низкая" | "средняя" | "высокая";
}

export interface DeveloperInfo {
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
}

export interface MarketPrice {
  city: string;
  avgPricePerSqmKzt?: number;
  source: "numbeo" | "fallback";
}

const MONTH_NAMES = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
];

export const fetchSolarData = async (lat: number, lon: number): Promise<SolarMonth[]> => {
  const url = new URL(PVGIS_BASE);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("peakpower", "1");
  url.searchParams.set("loss", "14");
  url.searchParams.set("outputformat", "json");

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });

  if (!response.ok) {
    throw new Error(`PVGIS error: ${response.status}`);
  }

  const data = (await response.json()) as {
    outputs?: {
      monthly?: {
        fixed?: Array<{ month: number; "E_m": number }>
      }
    }
  };

  const monthly = data.outputs?.monthly?.fixed ?? [];

  return monthly.map((item) => ({
    month: MONTH_NAMES[(item.month - 1) % 12],
    kwhPerM2: Math.round(item["E_m"] * 10) / 10
  }));
};

export const fetchClimateData = async (lat: number, lon: number): Promise<ClimateMonth[]> => {
  const url = new URL(OPEN_METEO_BASE);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("start_date", "2020-01-01");
  url.searchParams.set("end_date", "2024-12-31");
  url.searchParams.set("monthly", "temperature_2m_mean");

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
    throw new Error(`Open-Meteo error: ${response.status}`);
  }

  const data = (await response.json()) as {
    monthly?: {
      time?: string[];
      temperature_2m_mean?: number[];
    }
  };

  const times = data.monthly?.time ?? [];
  const temps = data.monthly?.temperature_2m_mean ?? [];

  const byMonth: Record<number, number[]> = {};
  times.forEach((t, i) => {
    const m = new Date(t).getUTCMonth();
    (byMonth[m] ??= []).push(temps[i] ?? 0);
  });

  return MONTH_NAMES.map((name, idx) => {
    const vals = byMonth[idx] ?? [];
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { month: name, avgTempC: Math.round(avg * 10) / 10 };
  });
};

export const fetchGreeneryData = async (lat: number, lon: number): Promise<GreeneryResult> => {
  const query = `
    [out:json][timeout:15];
    (
      way["leisure"="park"](around:1000,${lat},${lon});
      way["natural"="wood"](around:1000,${lat},${lon});
      node["natural"="tree"](around:500,${lat},${lon});
    );
    out count;
  `;

  const response = await fetch(OVERPASS_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(`Overpass error: ${response.status}`);
  }

  const data = (await response.json()) as {
    elements?: Array<{ tags?: { total?: string } }>
  };

  const total = Number(data.elements?.[0]?.tags?.total ?? 0);
  const parkQuery = `
    [out:json][timeout:15];
    (
      way["leisure"="park"](around:1000,${lat},${lon});
      way["natural"="wood"](around:1000,${lat},${lon});
    );
    out count;
  `;

  const parkResponse = await fetch(OVERPASS_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(parkQuery)}`,
    signal: AbortSignal.timeout(20000)
  });

  const parkData = (await parkResponse.json()) as {
    elements?: Array<{ tags?: { total?: string } }>
  };

  const parkCount = Number(parkData.elements?.[0]?.tags?.total ?? 0);
  const treeCount = total - parkCount;

  const score = Math.min(10, Math.round((parkCount * 2 + treeCount * 0.1)));
  const treeDensity: GreeneryResult["treeDensity"] =
    treeCount > 50 ? "высокая" : treeCount > 15 ? "средняя" : "низкая";

  return { score, parkCount, treeDensity };
};

const CITY_NUMBEO_MAP: Record<string, string> = {
  "Астана": "Astana",
  "Алматы": "Almaty"
};

const FALLBACK_PRICES: Record<string, number> = {
  "Астана": 680_000,
  "Алматы": 920_000
};

export const fetchMarketPrices = async (city: string): Promise<MarketPrice> => {
  const numbeoKey = process.env.NUMBEO_API_KEY;

  if (!numbeoKey) {
    return { city, avgPricePerSqmKzt: FALLBACK_PRICES[city], source: "fallback" };
  }

  const numbeoCity = CITY_NUMBEO_MAP[city] ?? city;
  const url = new URL(NUMBEO_BASE);
  url.searchParams.set("api_key", numbeoKey);
  url.searchParams.set("query", numbeoCity);

  try {
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });

    if (!response.ok) {
      return { city, avgPricePerSqmKzt: FALLBACK_PRICES[city], source: "fallback" };
    }

    const data = (await response.json()) as {
      prices?: Array<{ item_id: number; average_price: number }>
    };

    // Numbeo item_id 27 = "Price per Square Meter to Buy Apartment in City Centre"
    const priceItem = data.prices?.find((p) => p.item_id === 27);

    if (!priceItem) {
      return { city, avgPricePerSqmKzt: FALLBACK_PRICES[city], source: "fallback" };
    }

    // Numbeo returns USD price; convert at ~470 KZT/USD approximation
    const kztRate = Number(process.env.USD_KZT_RATE ?? 470);
    const avgPricePerSqmKzt = Math.round(priceItem.average_price * kztRate);

    return { city, avgPricePerSqmKzt, source: "numbeo" };
  } catch {
    return { city, avgPricePerSqmKzt: FALLBACK_PRICES[city], source: "fallback" };
  }
};

export const fetchDeveloperInfo = async (
  address: string,
  city: string
): Promise<DeveloperInfo[]> => {
  const apiKey =
    process.env.TWO_GIS_API_KEY ||
    process.env.VITE_2GIS_API_KEY ||
    process.env.DGIS_API_KEY ||
    "";

  if (!apiKey) {
    return [];
  }

  const query = `${address}, ${city}`;
  const url = new URL("https://catalog.api.2gis.com/3.0/items/geocode");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("locale", "ru_KZ");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "building");
  url.searchParams.set("fields", "items.org,items.name,items.contact_groups");
  url.searchParams.set("page_size", "1");

  try {
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });

    if (!response.ok) return [];

    const data = (await response.json()) as {
      result?: {
        items?: Array<{
          name?: string;
          org?: { name?: string; rating?: number; review_count?: number };
          contact_groups?: Array<{ contacts?: Array<{ type: string; value: string }> }>;
        }>
      }
    };

    const items = data.result?.items ?? [];

    return items.slice(0, 3).map((item) => {
      const phone = item.contact_groups
        ?.flatMap((g) => g.contacts ?? [])
        .find((c) => c.type === "phone")?.value;

      return {
        name: item.org?.name ?? item.name ?? "Застройщик",
        rating: item.org?.rating,
        reviewCount: item.org?.review_count,
        phone
      };
    });
  } catch {
    return [];
  }
};
