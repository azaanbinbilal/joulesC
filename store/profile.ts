import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Profile } from '@/types/profile';

interface ProfileState {
  profile: Profile | null;
  hasOnboarded: boolean;
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      hasOnboarded: false,
      hydrated: false,
      setProfile: (p) => set({ profile: p, hasOnboarded: true }),
      updateProfile: (patch) =>
        set((s) => ({
          profile: s.profile
            ? { ...s.profile, ...patch, updatedAt: new Date().toISOString() }
            : null,
        })),
      clearProfile: () => set({ profile: null, hasOnboarded: false }),
    }),
    {
      name: 'joulesc.profile',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
