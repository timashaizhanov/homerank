import { create } from "zustand";

interface FavoritesState {
  ids: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const STORAGE_KEY = "qala-favorites";

const getInitialIds = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: getInitialIds(),
  toggleFavorite: (id) => {
    const current = get().ids;
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    set({ ids: next });
  },
  isFavorite: (id) => get().ids.includes(id)
}));
