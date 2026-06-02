function dateMs(d: string): number {
  return Date.parse(d + 'T00:00:00');
}

function shiftDate(d: string, deltaDays: number): string {
  const dt = new Date(dateMs(d) + deltaDays * 86_400_000);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface StreakInput {
  /** Set of YYYY-MM-DD dates where the user logged at least one food entry. */
  foodDates: Set<string>;
  /** Map of YYYY-MM-DD to total ml consumed that day. */
  hydrationTotalsByDate: Map<string, number>;
  hydrationGoalMl: number;
  today: string;
}

function dayQualifies(date: string, input: StreakInput): boolean {
  const hitFood = input.foodDates.has(date);
  const hitWater = (input.hydrationTotalsByDate.get(date) ?? 0) >= input.hydrationGoalMl;
  return hitFood && hitWater;
}

/**
 * Count consecutive days ending today (or yesterday, if today is incomplete) where
 * the user both logged at least one food entry and met their hydration goal.
 *
 * Today is allowed to be "incomplete" — if today doesn't yet qualify, we still
 * report the streak that ended yesterday rather than wiping it to 0 mid-day.
 */
export function computeStreak(input: StreakInput): number {
  let cursor = input.today;
  if (!dayQualifies(cursor, input)) {
    cursor = shiftDate(cursor, -1);
  }
  let count = 0;
  while (dayQualifies(cursor, input)) {
    count++;
    cursor = shiftDate(cursor, -1);
  }
  return count;
}
