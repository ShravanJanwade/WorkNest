import { create } from "zustand";
import { Suspense } from "react";

type CreateEpicModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useCreateEpicModal = create<CreateEpicModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
