import { create } from "zustand";

interface PurchaseRecord {
  propertyId: string;
  title: string;
  amountKzt: number;
  purchasedAt: string;
}

interface PurchasesState {
  records: PurchaseRecord[];
  purchaseReport: (record: Omit<PurchaseRecord, "purchasedAt">) => void;
  hasReport: (propertyId: string) => boolean;
}

const STORAGE_KEY = "qala-purchases";

const getInitialRecords = (): PurchaseRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as PurchaseRecord[];
  } catch {
    return [];
  }
};

export const usePurchasesStore = create<PurchasesState>((set, get) => ({
  records: getInitialRecords(),
  purchaseReport: (record) => {
    if (get().records.some((item) => item.propertyId === record.propertyId)) {
      return;
    }

    const next = [
      {
        ...record,
        purchasedAt: new Date().toISOString()
      },
      ...get().records
    ];

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    set({ records: next });
  },
  hasReport: (propertyId) => get().records.some((item) => item.propertyId === propertyId)
}));
