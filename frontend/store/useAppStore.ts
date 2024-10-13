import { create } from "zustand";

interface AppState {
    user: string | null;
    setUser: (user: string | null) => void;
}

export const useAppStore = create<AppState>((set: (arg0: { user: any; }) => any) => ({
    user: null,
    setUser: (user: any) => set({ user }),
}));
