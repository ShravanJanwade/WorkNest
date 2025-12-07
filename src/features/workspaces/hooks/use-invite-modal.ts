import { create } from "zustand";

type InviteModalStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useInviteModal = create<InviteModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
