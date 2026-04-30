import type {
  AdminSummaryResponse,
  AuthResponse,
  MarketAnalyticsResponse,
  Property,
  PropertyListResponse,
  ReportResponse,
  SearchFilters
} from "../types/domain";
import { buildQuery } from "./utils";

const API_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:4000/api`
    : "http://127.0.0.1:4000/api");

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
  getProperties(filters: SearchFilters, page = 1, pageSize = 24) {
    const query = buildQuery({
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
  getProperty(id: string) {
    return request<Property>(`/properties/${id}`);
  },
  getReport(id: string) {
    return request<ReportResponse>(`/properties/${id}/report`);
  },
  getAnalytics() {
    return request<MarketAnalyticsResponse>("/properties/analytics/market");
  },
  getAdminSummary() {
    return request<AdminSummaryResponse>("/admin/summary");
  },
  async login(email: string, password: string) {
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
