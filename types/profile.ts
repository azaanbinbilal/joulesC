import type { ActivityLevel, GoalDirection, Sex } from '@/lib/health';
import type { HeightUnit, WeightUnit } from '@/lib/units';

export interface ProfileGoal {
  direction: GoalDirection;
  targetWeightKg: number;
  targetDate: string;
  weeks: number;
}

export interface Profile {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  preferences: {
    weightUnit: WeightUnit;
    heightUnit: HeightUnit;
  };
  goal: ProfileGoal | null;
  createdAt: string;
  updatedAt: string;
}
