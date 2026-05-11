export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalDirection = 'lose' | 'gain' | 'maintain';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const KCAL_PER_KG_FAT = 7700;

export function calcBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calcTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activity];
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export function bmiCategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export interface GoalInput {
  currentWeightKg: number;
  targetWeightKg: number;
  weeks: number;
  tdee: number;
}

export interface GoalPlan {
  direction: GoalDirection;
  totalKgChange: number;
  weeklyKgRate: number;
  dailyKcalDelta: number;
  dailyKcalTarget: number;
  estimatedDays: number;
}

export function buildGoalPlan(input: GoalInput): GoalPlan {
  const delta = input.targetWeightKg - input.currentWeightKg;
  const direction: GoalDirection =
    Math.abs(delta) < 0.5 ? 'maintain' : delta < 0 ? 'lose' : 'gain';
  const weeks = Math.max(input.weeks, 1);
  const weeklyKgRate = Math.abs(delta) / weeks;
  const dailyKcalDelta =
    direction === 'maintain' ? 0 : (delta / weeks / 7) * KCAL_PER_KG_FAT;
  const dailyKcalTarget = Math.round(input.tdee + dailyKcalDelta);
  return {
    direction,
    totalKgChange: delta,
    weeklyKgRate,
    dailyKcalDelta: Math.round(dailyKcalDelta),
    dailyKcalTarget,
    estimatedDays: weeks * 7,
  };
}

export type FeasibilityLevel = 'safe' | 'aggressive' | 'unsafe';

export interface FeasibilityCheck {
  level: FeasibilityLevel;
  reasons: string[];
  suggestedWeeks?: number;
}

export function evaluateFeasibility(input: GoalInput, plan: GoalPlan): FeasibilityCheck {
  const reasons: string[] = [];
  let level: FeasibilityLevel = 'safe';

  if (plan.direction === 'maintain') {
    return { level: 'safe', reasons: ['Maintenance goal — keeps current weight.'] };
  }

  const weeklyPercent = (plan.weeklyKgRate / input.currentWeightKg) * 100;

  if (plan.direction === 'lose') {
    if (weeklyPercent > 1.5) {
      level = 'unsafe';
      reasons.push(
        `Loss rate of ${weeklyPercent.toFixed(2)}%/week risks muscle loss and metabolic slowdown.`,
      );
    } else if (weeklyPercent > 1) {
      level = 'aggressive';
      reasons.push(
        `Loss rate of ${weeklyPercent.toFixed(2)}%/week is on the high end. Sustainable max is ~1%/week.`,
      );
    }
    const deficitPercent = (-plan.dailyKcalDelta / input.tdee) * 100;
    if (deficitPercent > 30) {
      level = 'unsafe';
      reasons.push(
        `Daily deficit is ${deficitPercent.toFixed(0)}% of TDEE — usually unsustainable beyond a few weeks.`,
      );
    } else if (deficitPercent > 20) {
      if (level !== 'unsafe') level = 'aggressive';
      reasons.push(
        `Daily deficit is ${deficitPercent.toFixed(0)}% of TDEE. 15–20% is the comfortable max for most.`,
      );
    }
  }

  if (plan.direction === 'gain') {
    if (plan.weeklyKgRate > 1) {
      level = 'unsafe';
      reasons.push(
        `Gain rate of ${plan.weeklyKgRate.toFixed(2)} kg/week is mostly fat gain at any training level.`,
      );
    } else if (plan.weeklyKgRate > 0.5) {
      level = 'aggressive';
      reasons.push(
        `Gain rate of ${plan.weeklyKgRate.toFixed(2)} kg/week likely means meaningful fat gain alongside muscle.`,
      );
    }
  }

  let suggestedWeeks: number | undefined;
  if (level !== 'safe') {
    const safeRatePerWeek = input.currentWeightKg * 0.0075;
    suggestedWeeks = Math.ceil(Math.abs(plan.totalKgChange) / safeRatePerWeek);
  }

  if (reasons.length === 0) {
    reasons.push('Goal is within healthy weekly change ranges.');
  }

  return { level, reasons, suggestedWeeks };
}
