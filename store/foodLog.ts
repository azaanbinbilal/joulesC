import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { FoodEntry } from '@/types/food';

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface FoodLogState {
  entries: FoodEntry[];
  hydrated: boolean;
  addEntry: (e: Omit<FoodEntry, 'id' | 'loggedAt' | 'date'> & { date?: string }) => void;
  removeEntry: (id: string) => void;
  entriesForDate: (date: string) => FoodEntry[];
}

function newId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      addEntry: (e) => {
        const now = new Date();
        const entry: FoodEntry = {
          ...e,
          id: newId(),
          loggedAt: now.toISOString(),
          date: e.date ?? todayISO(),
        };
        set((s) => ({ entries: [...s.entries, entry] }));
      },
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((x) => x.id !== id) })),
      entriesForDate: (date) => get().entries.filter((x) => x.date === date),
    }),
    {
      name: 'joulesc.foodLog',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
