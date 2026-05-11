import { create } from 'zustand';

import type { ActivityLevel, GoalDirection, Sex } from '@/lib/health';
import type { HeightUnit, WeightUnit } from '@/lib/units';

export interface OnboardingDraft {
  name?: string;
  age?: number;
  sex?: Sex;
  weightKg?: number;
  heightCm?: number;
  activity?: ActivityLevel;
  preferences: { weightUnit: WeightUnit; heightUnit: HeightUnit };
  goalDirection?: GoalDirection;
  goalTargetWeightKg?: number;
  goalWeeks?: number;
}

interface OnboardingState {
  draft: OnboardingDraft;
  set: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

const initial: OnboardingDraft = {
  preferences: { weightUnit: 'kg', heightUnit: 'cm' },
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  draft: initial,
  set: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  reset: () => set({ draft: initial }),
}));
