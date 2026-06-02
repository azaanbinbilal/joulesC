import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { todayISO } from '@/store/foodLog';
import type { WeightEntry } from '@/types/weight';

function newId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isoToDate(iso: string): string {
  return iso.slice(0, 10);
}

interface WeightLogState {
  entries: WeightEntry[];
  hydrated: boolean;
  addEntry: (input: { weightKg: number; date?: string; seeded?: boolean }) => void;
  removeEntry: (id: string) => void;
  seedFromProfile: (weightKg: number, profileCreatedAt: string) => void;
}

export const useWeightLogStore = create<WeightLogState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      addEntry: ({ weightKg, date, seeded }) => {
        const entry: WeightEntry = {
          id: newId(),
          weightKg,
          date: date ?? todayISO(),
          loggedAt: new Date().toISOString(),
          seeded: seeded === true ? true : undefined,
        };
        set((s) => ({ entries: [...s.entries, entry] }));
      },
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((x) => x.id !== id) })),
      seedFromProfile: (weightKg, profileCreatedAt) => {
        if (get().entries.length > 0) return;
        const seedDate = isoToDate(profileCreatedAt);
        get().addEntry({ weightKg, date: seedDate, seeded: true });
      },
    }),
    {
      name: 'joulesc.weightLog',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
