export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export interface FoodEntry {
  id: string;
  fdcId: number;
  description: string;
  brand?: string;
  meal: MealType;
  grams: number;
  /** Natural-language serving label, e.g. "1 cup" or "2 eggs". Optional —
   *  legacy entries written before this field existed will be undefined. */
  servingLabel?: string;
  per100g: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  loggedAt: string;
  date: string;
}
