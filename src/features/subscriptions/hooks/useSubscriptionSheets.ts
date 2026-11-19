import { create } from "zustand";

type SubscriptionSheetsState = {
  newSheetVisible: boolean;
  detailSubscriptionId: string | null;
  editSubscriptionId: string | null;
  savingsSubscriptionId: string | null;
  openNewSheet: () => void;
  closeNewSheet: () => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openEdit: (id: string) => void;
  closeEdit: () => void;
  openSavings: (id: string) => void;
  closeSavings: () => void;
};

/**
 * Visibilidad de los sheets de "nueva suscripción" y "detalle", montados
 * siempre en `_layout.tsx` como overlays globales (patrón de anchor-app) en
 * vez de rutas `transparentModal` de expo-router — evita el rectángulo
 * negro residual que dejaba la doble animación de salida (nuestro
 * drag-to-dismiss por Reanimated + la transición propia de la ruta al
 * hacer `router.back()`).
 */
export const useSubscriptionSheets = create<SubscriptionSheetsState>((set) => ({
  newSheetVisible: false,
  detailSubscriptionId: null,
  editSubscriptionId: null,
  savingsSubscriptionId: null,
  openNewSheet: () => set({ newSheetVisible: true }),
  closeNewSheet: () => set({ newSheetVisible: false }),
  openDetail: (id) => set({ detailSubscriptionId: id }),
  closeDetail: () => set({ detailSubscriptionId: null }),
  openEdit: (id) => set({ editSubscriptionId: id }),
  closeEdit: () => set({ editSubscriptionId: null }),
  openSavings: (id) => set({ savingsSubscriptionId: id }),
  closeSavings: () => set({ savingsSubscriptionId: null }),
}));
