import { allProperties, districtAnalytics, properties } from "../data/properties.js";
import { Property, PropertyFilters } from "../types/domain.js";

const parseNumber = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseArray = (value?: string): string[] | undefined => {
  if (!value) {
    return undefined;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getFiltersFromQuery = (query: Record<string, string | undefined>): PropertyFilters => ({
  searchQuery: query.searchQuery,
  city: query.city,
  district: parseArray(query.district),
  operation: query.operation as PropertyFilters["operation"],
  rooms: parseArray(query.rooms),
  minPrice: parseNumber(query.minPrice),
  maxPrice: parseNumber(query.maxPrice),
  minArea: parseNumber(query.minArea),
  maxArea: parseNumber(query.maxArea),
  marketType: query.marketType,
  buildingType: parseArray(query.buildingType),
  condition: parseArray(query.condition),
  notFirstFloor: query.notFirstFloor === "true",
  notLastFloor: query.notLastFloor === "true"
});

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

const matchesSearchQuery = (property: Property, query?: string) => {
  if (!query?.trim()) {
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

export const filterProperties = (filters: PropertyFilters): Property[] =>
  properties.filter((property) => {
    if (!matchesSearchQuery(property, filters.searchQuery)) {
      return false;
    }

    if (filters.city && property.city !== filters.city) {
      return false;
    }

    if (filters.district?.length && !filters.district.includes(property.district)) {
      return false;
    }

    if (filters.operation && property.operation !== filters.operation) {
      return false;
    }

    if (filters.rooms?.length && property.rooms && !filters.rooms.includes(property.rooms)) {
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
      filters.buildingType?.length &&
      property.buildingType &&
      !filters.buildingType.includes(property.buildingType)
    ) {
      return false;
    }

    if (
      filters.condition?.length &&
      property.condition &&
      !filters.condition.includes(property.condition)
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

export const getPropertyById = (id: string): Property | undefined =>
  allProperties.find((property) => property.id === id || property.slug === id);

const getDistanceBetweenCoordinatesKm = (from: [number, number], to: [number, number]) => {
  const earthRadiusKm = 6371;
  const lat1 = (from[1] * Math.PI) / 180;
  const lat2 = (to[1] * Math.PI) / 180;
  const deltaLat = ((to[1] - from[1]) * Math.PI) / 180;
  const deltaLon = ((to[0] - from[0]) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const getComparableProperties = (property: Property) => {
  const comparableItems = properties
    .filter((candidate) =>
      candidate.id !== property.id &&
      candidate.city === property.city &&
      candidate.operation === property.operation &&
      candidate.category === property.category
    )
    .map((candidate) => {
      const distanceKm = getDistanceBetweenCoordinatesKm(property.coordinates, candidate.coordinates);
      const score =
        (candidate.district === property.district ? 0 : 180) +
        (candidate.rooms === property.rooms ? 0 : 120) +
        (candidate.propertyType === property.propertyType ? 0 : 80) +
        Math.abs(candidate.pricePerSqm - property.pricePerSqm) / 2500 +
        Math.abs(candidate.areaTotal - property.areaTotal) * 1.8 +
        distanceKm * 14;

      return { candidate, distanceKm, score };
    })
    .sort((left, right) => left.score - right.score)
    .slice(0, 5)
    .map(({ candidate, distanceKm }) => ({
      id: candidate.id,
      title: candidate.title,
      price: candidate.price,
      pricePerSqm: candidate.pricePerSqm,
      area: candidate.areaTotal,
      distanceKm: Number(distanceKm.toFixed(1))
    }));

  return comparableItems.length ? comparableItems : property.analytics.comparables;
};

export const getPropertyReport = (id: string) => {
  const property = getPropertyById(id);

  if (!property) {
    return undefined;
  }

  return {
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
      comparables: getComparableProperties(property),
      liquidity: property.analytics.liquidity,
      exposureDays: property.analytics.exposureDays
    },
    seller: property.seller
  };
};

export const getAnalyticsOverview = () => ({
  districts: districtAnalytics,
  topOpportunities: properties
    .map((property) => ({
      id: property.id,
      title: property.title,
      city: property.city,
      district: property.district,
      rentYield: property.analytics.rentYield,
      roi3y: property.analytics.roi3y,
      liquidity: property.analytics.liquidity
    }))
    .sort((a, b) => b.roi3y - a.roi3y)
    .slice(0, 5)
});
