export type City = "Астана" | "Алматы";
export type Operation = "sale" | "rent_long" | "rent_daily" | "sublease";
export type CityFilter = City | "all";
export type OperationFilter = Operation | "all";
export type TravelMode = "driving" | "public_transport" | "walking";

export interface Coordinates {
  lon: number;
  lat: number;
}

export interface PricePoint {
  month: string;
  value: number;
}

export interface ComparableProperty {
  id: string;
  title: string;
  price: number;
  pricePerSqm: number;
  area: number;
  distanceKm: number;
}

export interface InfrastructureItem {
  name: string;
  category: string;
  distanceKm: number;
  rating?: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  category: string;
  propertyType: string;
  operation: Operation;
  city: City;
  district: string;
  address: string;
  coordinates: [number, number];
  price: number;
  currency: "KZT" | "USD";
  pricePerSqm: number;
  areaTotal: number;
  areaLiving?: number;
  areaKitchen?: number;
  rooms?: string;
  floor?: number;
  floorsTotal?: number;
  yearBuilt?: number;
  buildingType?: string;
  marketType?: string;
  condition?: string;
  features: string[];
  images: string[];
  badges: string[];
  nearbyCount: number;
  distanceToTransitKm: number;
  districtScore: number;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  description: string;
  seller?: {
    name: string;
    phone: string;
    agency?: string;
  };
  details: Record<string, string | number | boolean | string[]>;
  analytics: {
    priceTrend6m: PricePoint[];
    priceTrend12m: PricePoint[];
    rentYield: number;
    capRate: number;
    roi1y: number;
    roi3y: number;
    roi5y: number;
    depositComparison: string;
    liquidity: string;
    exposureDays: number;
    comparables: ComparableProperty[];
  };
  infrastructure: InfrastructureItem[];
  legal: {
    ownershipHistory: string;
    encumbrances: string;
    pledgeCheck: string;
    documentType: string;
  };
}

export interface PropertyListResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: Property[];
}

export interface ReportResponse {
  unlocked: boolean;
  amountKzt: number;
  propertyId: string;
  priceHistory: Array<{
    date: string;
    pricePerSqm: number;
  }>;
  investment: {
    rentYield: number;
    capRate: number;
    roiForecast: Record<string, number>;
    depositComparison: string;
  };
  legal: Property["legal"];
  infrastructure: InfrastructureItem[];
  market: {
    comparables: ComparableProperty[];
    liquidity: string;
    exposureDays: number;
  };
  seller?: Property["seller"];
}

export interface MarketAnalyticsResponse {
  districts: Array<{
    city: City;
    district: string;
    avgPriceSqm: number;
    listingsCount: number;
    demandIndex: number;
    trend: PricePoint[];
  }>;
  topOpportunities: Array<{
    id: string;
    title: string;
    city: City;
    district: string;
    rentYield: number;
    roi3y: number;
    liquidity: string;
  }>;
}

export interface AdminSummaryResponse {
  totals: {
    properties: number;
    activeParsers: number;
    successfulPayments: number;
    reportRevenueKzt: number;
  };
  parserJobs: Array<{
    source: string;
    lastRunAt: string;
    status: string;
    fetched: number;
    deduplicated: number;
  }>;
  queues: Array<{
    name: string;
    nextRun: string;
    interval: string;
  }>;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface SearchFilters {
  city: CityFilter;
  operation: OperationFilter;
  district: string[];
  rooms: string[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  marketType?: string;
  buildingType: string[];
  condition: string[];
  notFirstFloor: boolean;
  notLastFloor: boolean;
  workAddress: string;
  workLocation: Coordinates | null;
  travelMode: TravelMode;
  maxTravelMinutes?: number;
}

export interface AddressSuggestion {
  label: string;
  location: Coordinates;
}

export interface IsochroneResult {
  polygons: Array<Array<[number, number]>>;
  source: Coordinates;
  durationSeconds: number;
}
