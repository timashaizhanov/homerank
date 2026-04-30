import { create } from "zustand";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  logout: () => void;
}

const STORAGE_KEY = "qala-auth";

const getInitialState = (): { user: AuthUser | null; token: string | null } => {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return { user: null, token: null };
  }

  try {
    return JSON.parse(raw) as { user: AuthUser; token: string };
  } catch {
    return { user: null, token: null };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  setAuth: ({ user, token }) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    }

    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    set({ user: null, token: null });
  }
}));
