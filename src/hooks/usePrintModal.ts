import { create } from "zustand";

interface PrintModalState {
  open: boolean;
  orderIds: string | string[] | null;
  type: "a4" | "pos" | "label" | null;
  onSuccess?: () => void;
  workflow?: "packing";
  openModal: (
    orderIds: string | string[],
    type: "a4" | "pos" | "label",
    url: string,
    onSuccess?: () => void,
    workflow?: "packing",
  ) => void;
  closeModal: () => void;
}

export const usePrintModal = create<PrintModalState>((set) => ({
  open: false,
  orderIds: null,
  type: null,
  onSuccess: undefined,
  openModal: (orderIds, type, url, onSuccess, workflow) => {
    window.open(url, "_blank", "noopener,noreferrer");
    set({ open: true, orderIds, type, onSuccess, workflow });
  },
  closeModal: () => set({ open: false, orderIds: null, type: null, onSuccess: undefined, workflow: undefined }),
}));
