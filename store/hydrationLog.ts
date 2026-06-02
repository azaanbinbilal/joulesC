import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { todayISO } from '@/store/foodLog';
import type { HydrationEntry } from '@/types/hydration';

function newId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface HydrationLogState {
  entries: HydrationEntry[];
  hydrated: boolean;
  addEntry: (input: { ml: number; date?: string }) => void;
  removeEntry: (id: string) => void;
  totalForDate: (date: string) => number;
}

export const useHydrationLogStore = create<HydrationLogState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      addEntry: ({ ml, date }) => {
        if (!Number.isFinite(ml) || ml <= 0) return;
        const entry: HydrationEntry = {
          id: newId(),
          ml: Math.round(ml),
          date: date ?? todayISO(),
          loggedAt: new Date().toISOString(),
        };
        set((s) => ({ entries: [...s.entries, entry] }));
      },
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((x) => x.id !== id) })),
      totalForDate: (date) =>
        get()
          .entries.filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.ml, 0),
    }),
    {
      name: 'joulesc.hydrationLog',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
