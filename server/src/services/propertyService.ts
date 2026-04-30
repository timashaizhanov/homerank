import { districtAnalytics, properties } from "../data/properties.js";
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

export const filterProperties = (filters: PropertyFilters): Property[] =>
  properties.filter((property) => {
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
  properties.find((property) => property.id === id || property.slug === id);

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
      comparables: property.analytics.comparables,
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
