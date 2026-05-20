import type { GoalDirection } from '@/lib/health';

export interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MacroTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARB = 4;
const KCAL_PER_G_FAT = 9;

export function computeMacroTargets(
  kcalTarget: number,
  weightKg: number,
  direction: GoalDirection,
): MacroTargets {
  // Protein scales with goal: more for cuts (preserve muscle), less for maintenance.
  const proteinPerKg = direction === 'lose' ? 2.0 : direction === 'gain' ? 1.8 : 1.6;
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((kcalTarget * 0.25) / KCAL_PER_G_FAT);
  const carbs = Math.max(
    0,
    Math.round(
      (kcalTarget - protein * KCAL_PER_G_PROTEIN - fat * KCAL_PER_G_FAT) / KCAL_PER_G_CARB,
    ),
  );
  const fiber = Math.round((kcalTarget / 1000) * 14);
  return { kcal: kcalTarget, protein, carbs, fat, fiber };
}

export function emptyTotals(): MacroTotals {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
}

export function addTotals(a: MacroTotals, b: MacroTotals): MacroTotals {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    fiber: a.fiber + b.fiber,
  };
}

export function scalePer100g(per100g: MacroTotals, grams: number): MacroTotals {
  const scale = grams / 100;
  return {
    kcal: per100g.kcal * scale,
    protein: per100g.protein * scale,
    carbs: per100g.carbs * scale,
    fat: per100g.fat * scale,
    fiber: per100g.fiber * scale,
  };
}
