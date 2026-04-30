import { create } from "zustand";
import type { SearchFilters } from "../types/domain";

const initialFilters: SearchFilters = {
  city: "all",
  operation: "all",
  district: [],
  rooms: [],
  buildingType: [],
  condition: [],
  notFirstFloor: false,
  notLastFloor: false,
  workAddress: "",
  workLocation: null,
  travelMode: "driving"
};

interface SearchState {
  filters: SearchFilters;
  viewMode: "list" | "map";
  locale: "ru" | "kk";
  setFilters: (next: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setViewMode: (mode: "list" | "map") => void;
  toggleLocale: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: initialFilters,
  viewMode: "list",
  locale: "ru",
  setFilters: (next) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...next
      }
    })),
  resetFilters: () => set({ filters: initialFilters }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleLocale: () =>
    set((state) => ({
      locale: state.locale === "ru" ? "kk" : "ru"
    }))
}));
