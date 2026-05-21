import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { todayISO } from '@/store/foodLog';
import type { ActivityEntry } from '@/types/activity';

function newId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface ActivityLogState {
  entries: ActivityEntry[];
  hydrated: boolean;
  addEntry: (
    e: Omit<ActivityEntry, 'id' | 'loggedAt' | 'date'> & { date?: string },
  ) => void;
  removeEntry: (id: string) => void;
  entriesForDate: (date: string) => ActivityEntry[];
}

export const useActivityLogStore = create<ActivityLogState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      addEntry: (e) => {
        const entry: ActivityEntry = {
          ...e,
          id: newId(),
          loggedAt: new Date().toISOString(),
          date: e.date ?? todayISO(),
        };
        set((s) => ({ entries: [...s.entries, entry] }));
      },
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((x) => x.id !== id) })),
      entriesForDate: (date) => get().entries.filter((x) => x.date === date),
    }),
    {
      name: 'joulesc.activityLog',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
