import type {
  AdminSummaryResponse,
  AuthResponse,
  MarketAnalyticsResponse,
  Property,
  PropertyListResponse,
  ReportResponse,
  SearchFilters
} from "../types/domain";
import { geocodeAddress } from "./2gis";
import { buildQuery } from "./utils";

const API_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:4000/api`
    : "http://127.0.0.1:4000/api");
const STATIC_API_URL = `${import.meta.env.BASE_URL}api`;
const usesStaticApi =
  typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
export const usesStaticApiMode = usesStaticApi;

let staticPropertiesCache: Promise<Property[]> | null = null;
let staticAnalyticsCache: Promise<MarketAnalyticsResponse> | null = null;

const getStaticProperties = () => {
  staticPropertiesCache ??= fetch(`${STATIC_API_URL}/properties.json`).then((response) => {
    if (!response.ok) {
      throw new Error(`Static API error: ${response.status}`);
    }

    return response.json() as Promise<Property[]>;
  });

  return staticPropertiesCache;
};

const getStaticAnalytics = () => {
  staticAnalyticsCache ??= fetch(`${STATIC_API_URL}/analytics.json`).then((response) => {
    if (!response.ok) {
      throw new Error(`Static API error: ${response.status}`);
    }

    return response.json() as Promise<MarketAnalyticsResponse>;
  });

  return staticAnalyticsCache;
};

const searchStopWords = new Set([
  "в",
  "во",
  "на",
  "с",
  "со",
  "и",
  "или",
  "для",
  "по",
  "у",
  "от",
  "до",
  "за",
  "рядом",
  "около",
  "возле",
  "квартира",
  "квартиру",
  "объект",
  "объекты"
]);

const normalizeSearchText = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSearchTokens = (value: string) =>
  normalizeSearchText(value)
    .split(" ")
    .filter((token: string) => token.length > 1 && !searchStopWords.has(token));

const districtSearchAliases: Record<string, string> = {
  Есиль: "Есиле",
  Нура: "Нуре",
  Сарыарка: "Сарыарке",
  Сарайшык: "Сарайшыке",
  Байконур: "Байконуре",
  Алматинский: "Алматинском",
  Бостандыкский: "Бостандыкском",
  Медеуский: "Медеуском",
  Алмалинский: "Алмалинском",
  Ауэзовский: "Ауэзовском",
  Алатауский: "Алатауском",
  Наурызбайский: "Наурызбайском",
  Турксибский: "Турксибском",
  Жетысуский: "Жетысуском"
};

const parseSearchConstraints = (query: string) => {
  const normalized = normalizeSearchText(query);
  const maxPriceMatch = normalized.match(/(?:до|меньше|ниже)\s+(\d+(?:[.,]\d+)?)\s*(?:млн|миллион|миллиона|миллионов)/);
  const minPriceMatch = normalized.match(/(?:от|выше|больше)\s+(\d+(?:[.,]\d+)?)\s*(?:млн|миллион|миллиона|миллионов)/);
  const roomsMatch = normalized.match(/(\d)\s*(?:комнатная|комнатную|комнаты|комнат|комн|ком)/);

  return {
    maxPrice: maxPriceMatch ? Number(maxPriceMatch[1].replace(",", ".")) * 1_000_000 : undefined,
    minPrice: minPriceMatch ? Number(minPriceMatch[1].replace(",", ".")) * 1_000_000 : undefined,
    rooms: roomsMatch?.[1],
    wantsStudio: normalized.includes("студия") || normalized.includes("студию"),
    tokens: getSearchTokens(
      normalized
        .replace(/(?:до|меньше|ниже|от|выше|больше)\s+\d+(?:[.,]\d+)?\s*(?:млн|миллион|миллиона|миллионов)/g, " ")
        .replace(/\d\s*(?:комнатная|комнатную|комнаты|комнат|комн|ком)/g, " ")
        .replace(/студия|студию/g, " ")
    )
  };
};

const buildPropertySearchText = (property: Property) => {
  const detailValues = Object.entries(property.details).flatMap(([key, value]) =>
    Array.isArray(value) ? [key, ...value] : [key, value]
  );
  const infrastructureValues = property.infrastructure.flatMap((item) => [
    item.name,
    item.category,
    `${item.distanceKm} км`
  ]);
  const operationLabels: Record<Property["operation"], string> = {
    sale: "продажа купить покупка",
    rent_long: "аренда долгосрочная снять",
    rent_daily: "посуточная аренда сутки",
    sublease: "субаренда"
  };

  return normalizeSearchText([
    property.title,
    property.city,
    property.district,
    districtSearchAliases[property.district],
    property.address,
    property.description,
    property.propertyType,
    property.category,
    operationLabels[property.operation],
    property.marketType,
    property.buildingType,
    property.condition,
    property.rooms ? `${property.rooms} комн ${property.rooms} комнатная` : "",
    property.yearBuilt,
    property.features,
    property.badges,
    detailValues,
    property.details.parking ? "паркинг паркингом парковка парковкой" : "",
    infrastructureValues,
    property.nearbyCount ? `${property.nearbyCount} точек инфраструктура рядом` : "",
    property.distanceToTransitKm ? `транспорт транспортом остановка ${property.distanceToTransitKm} км` : "",
    property.districtScore ? `инфраструктура ${property.districtScore} рейтинг` : "",
    property.analytics.rentYield ? `доходность ${property.analytics.rentYield}` : "",
    property.analytics.roi3y ? `roi инвестиция ${property.analytics.roi3y}` : "",
    property.price ? `${Math.round(property.price / 1_000_000)} млн ${property.price}` : "",
    property.pricePerSqm
  ].flat().join(" "));
};

const matchesSearchQuery = (property: Property, query: string) => {
  if (!query.trim()) {
    return true;
  }

  const constraints = parseSearchConstraints(query);

  if (constraints.maxPrice && property.price > constraints.maxPrice) {
    return false;
  }

  if (constraints.minPrice && property.price < constraints.minPrice) {
    return false;
  }

  if (constraints.rooms && property.rooms !== constraints.rooms) {
    return false;
  }

  if (constraints.wantsStudio && property.rooms !== "Студия") {
    return false;
  }

  if (!constraints.tokens.length) {
    return true;
  }

  const haystack = buildPropertySearchText(property);
  return constraints.tokens.every((token) => haystack.includes(token));
};

const filterStaticProperties = (properties: Property[], filters: SearchFilters) =>
  properties.filter((property) => {
    if (!matchesSearchQuery(property, filters.searchQuery)) {
      return false;
    }

    if (filters.city !== "all" && property.city !== filters.city) {
      return false;
    }

    if (filters.operation !== "all" && property.operation !== filters.operation) {
      return false;
    }

    if (filters.district.length && !filters.district.includes(property.district)) {
      return false;
    }

    if (filters.rooms.length && (!property.rooms || !filters.rooms.includes(property.rooms))) {
      return false;
    }

    if (filters.minPrice && property.price < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice && property.price > filters.maxPrice) {
      return false;
    }

    if (filters.minArea && property.areaTotal < filters.minArea) {
      return false;
    }

    if (filters.maxArea && property.areaTotal > filters.maxArea) {
      return false;
    }

    if (filters.marketType && property.marketType !== filters.marketType) {
      return false;
    }

    if (
      filters.buildingType.length &&
      (!property.buildingType || !filters.buildingType.includes(property.buildingType))
    ) {
      return false;
    }

    if (
      filters.condition.length &&
      (!property.condition || !filters.condition.includes(property.condition))
    ) {
      return false;
    }

    if (filters.notFirstFloor && property.floor === 1) {
      return false;
    }

    if (
      filters.notLastFloor &&
      property.floor !== undefined &&
      property.floorsTotal !== undefined &&
      property.floor === property.floorsTotal
    ) {
      return false;
    }

    return true;
  });

const getDistanceKm = (from: { lon: number; lat: number }, to: [number, number]) => {
  const earthRadiusKm = 6371;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to[1] * Math.PI) / 180;
  const deltaLat = ((to[1] - from.lat) * Math.PI) / 180;
  const deltaLon = ((to[0] - from.lon) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const filterStaticCommute = async (properties: Property[], filters: SearchFilters) => {
  if (filters.workAddress.trim().length < 3 || !filters.maxTravelMinutes) {
    return properties;
  }

  const location = filters.workLocation ?? (await geocodeAddress(filters.workAddress, filters.city));

  if (!location) {
    return properties;
  }

  const speedKmH =
    filters.travelMode === "driving" ? 28 : filters.travelMode === "public_transport" ? 22 : 5;
  const radiusKm = Math.max(0.4, (speedKmH * filters.maxTravelMinutes) / 60);

  return properties.filter((property) => getDistanceKm(location, property.coordinates) <= radiusKm);
};

const buildStaticReport = (property: Property): ReportResponse => ({
  unlocked: true,
  amountKzt: 3500,
  propertyId: property.id,
  priceHistory: property.analytics.priceTrend12m.map((point, index) => {
    const date = new Date(Date.UTC(2025, 4 + index, 1));

    return {
      date: date.toISOString().slice(0, 10),
      pricePerSqm: point.value
    };
  }),
  investment: {
    rentYield: property.analytics.rentYield,
    capRate: property.analytics.capRate,
    roiForecast: {
      "1y": property.analytics.roi1y,
      "3y": property.analytics.roi3y,
      "5y": property.analytics.roi5y
    },
    depositComparison: property.analytics.depositComparison
  },
  legal: property.legal,
  infrastructure: property.infrastructure,
  market: {
    comparables: property.analytics.comparables,
    liquidity: property.analytics.liquidity,
    exposureDays: property.analytics.exposureDays
  },
  seller: property.seller
});

async function request<T>(path: string): Promise<T> {
  const authRaw =
    typeof window !== "undefined" ? window.localStorage.getItem("qala-auth") : null;
  const auth = authRaw ? (JSON.parse(authRaw) as { token?: string }) : null;

  const response = await fetch(`${API_URL}${path}`, {
    headers: auth?.token
      ? {
          Authorization: `Bearer ${auth.token}`
        }
      : undefined
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  async getProperties(filters: SearchFilters, page = 1, pageSize = 24) {
    if (usesStaticApi) {
      const filtered = await filterStaticCommute(
        filterStaticProperties(await getStaticProperties(), filters),
        filters
      );
      const startIndex = (page - 1) * pageSize;

      return {
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        items: filtered.slice(startIndex, startIndex + pageSize)
      } satisfies PropertyListResponse;
    }

    const query = buildQuery({
      searchQuery: filters.searchQuery,
      city: filters.city === "all" ? undefined : filters.city,
      operation: filters.operation === "all" ? undefined : filters.operation,
      district: filters.district,
      rooms: filters.rooms,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minArea: filters.minArea,
      maxArea: filters.maxArea,
      marketType: filters.marketType,
      buildingType: filters.buildingType,
      condition: filters.condition,
      notFirstFloor: filters.notFirstFloor,
      notLastFloor: filters.notLastFloor,
      page,
      pageSize
    });

    return request<PropertyListResponse>(`/properties?${query}`);
  },
  async getProperty(id: string) {
    if (usesStaticApi) {
      const property = (await getStaticProperties()).find(
        (item) => item.id === id || item.slug === id
      );

      if (!property) {
        throw new Error("Static API error: property not found");
      }

      return property;
    }

    return request<Property>(`/properties/${id}`);
  },
  async getReport(id: string) {
    if (usesStaticApi) {
      return buildStaticReport(await api.getProperty(id));
    }

    return request<ReportResponse>(`/properties/${id}/report`);
  },
  getAnalytics() {
    if (usesStaticApi) {
      return getStaticAnalytics();
    }

    return request<MarketAnalyticsResponse>("/properties/analytics/market");
  },
  async getAdminSummary() {
    if (usesStaticApi) {
      const properties = await getStaticProperties();

      return {
        totals: {
          properties: properties.length,
          activeParsers: 1,
          successfulPayments: 38,
          reportRevenueKzt: 133000
        },
        parserJobs: [
          {
            source: "Krisha.kz",
            lastRunAt: "2026-04-16T16:00:00.000Z",
            status: "completed",
            fetched: 186,
            deduplicated: 21
          }
        ],
        queues: [
          { name: "krisha-apartments", nextRun: "Через 5 часов 22 минуты", interval: "6 часов" }
        ]
      } satisfies AdminSummaryResponse;
    }

    return request<AdminSummaryResponse>("/admin/summary");
  },
  async login(email: string, password: string) {
    if (usesStaticApi && email.toLowerCase() === "admin@qala.kz" && password === "Admin12345!") {
      return {
        user: {
          id: "admin@qala.kz",
          email: "admin@qala.kz",
          name: "Qala Admin",
          role: "admin"
        },
        token: "static-pages-demo-token"
      } satisfies AuthResponse;
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json() as Promise<AuthResponse>;
  },
  async register(payload: { email: string; name: string; password: string }) {
    if (usesStaticApi) {
      return {
        user: {
          id: payload.email.toLowerCase(),
          email: payload.email.toLowerCase(),
          name: payload.name,
          role: "user"
        },
        token: "static-pages-demo-token"
      } satisfies AuthResponse;
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json() as Promise<AuthResponse>;
  }
};
