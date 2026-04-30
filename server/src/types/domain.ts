export type City = "Астана" | "Алматы";
export type PropertyCategory = "residential" | "commercial" | "land";
export type Operation = "sale" | "rent_long" | "rent_daily" | "sublease";

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
  category: PropertyCategory;
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

export interface PropertyFilters {
  searchQuery?: string;
  city?: string;
  district?: string[];
  operation?: Operation;
  rooms?: string[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  marketType?: string;
  buildingType?: string[];
  condition?: string[];
  notFirstFloor?: boolean;
  notLastFloor?: boolean;
}
