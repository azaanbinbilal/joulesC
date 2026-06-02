import type { MacroTargets, MacroTotals } from '@/lib/macros';
import type { FoodEntry } from '@/types/food';

export type SuggestionKind = 'food' | 'activity' | 'timing' | 'tip';

export interface Suggestion {
  id: string;
  emoji: string;
  text: string;
  kind: SuggestionKind;
}

const PAIRINGS: { match: RegExp; emoji: string; pair: string; reason: string }[] = [
  { match: /\begg/i, emoji: '🥚', pair: 'curd or Greek yogurt', reason: 'doubles your protein hit' },
  { match: /\bbanana\b/i, emoji: '🍌', pair: 'a tbsp of peanut butter', reason: 'slows the sugar spike + adds healthy fat' },
  { match: /\brice\b/i, emoji: '🍚', pair: 'broccoli or paneer', reason: 'balances the carbs with fiber and protein' },
  { match: /chicken/i, emoji: '🍗', pair: 'sweet potato or quinoa', reason: 'classic post-workout combo' },
  { match: /\bpaneer\b/i, emoji: '🧀', pair: 'spinach or a chapati', reason: 'protein + iron, traditional pair' },
  { match: /\boat/i, emoji: '🥣', pair: 'banana and a tbsp peanut butter', reason: 'turns it into a balanced breakfast' },
  { match: /\b(bread|toast)\b/i, emoji: '🍞', pair: 'eggs or avocado', reason: 'pairs simple carbs with protein/fat' },
  { match: /\bapple\b/i, emoji: '🍎', pair: 'a handful of almonds', reason: 'keeps you full ~2 hrs longer' },
  { match: /\bmilk\b/i, emoji: '🥛', pair: 'oats or chia seeds', reason: 'turns a drink into a meal' },
  { match: /\bsalad\b/i, emoji: '🥗', pair: 'grilled chicken or chickpeas', reason: 'salads alone leave you hungry — add protein' },
  { match: /\bfries|chip/i, emoji: '🍟', pair: 'a tall glass of water + a 10-min walk', reason: 'helps blunt the blood-sugar spike' },
];

function guessShortName(description: string): string {
  return description.split(/[\s,]+/).slice(0, 2).join(' ').toLowerCase();
}

export interface SuggestionInput {
  targets: MacroTargets;
  totals: MacroTotals;
  burnedKcal: number;
  recentEntries: FoodEntry[];
  hour: number;
  /** Total kcal consumed across the last 7 days including today. */
  weekKcalConsumed: number;
  /** Total kcal burned via logged activity across the last 7 days including today. */
  weekKcalBurned: number;
  /** Distinct days in the last 7 with at least one food entry. */
  weekDaysLogged: number;
}

export function generateSuggestions(input: SuggestionInput): Suggestion[] {
  const out: Suggestion[] = [];
  const effectiveKcal = input.targets.kcal + input.burnedKcal;
  const remainingKcal = effectiveKcal - input.totals.kcal;
  const remainingProtein = input.targets.protein - input.totals.protein;
  const remainingFiber = input.targets.fiber - input.totals.fiber;

  if (remainingKcal < 0) {
    const overBy = Math.abs(Math.round(remainingKcal));

    if (overBy < 200) {
      out.push({
        id: 'over-mild',
        emoji: '👟',
        text: `You're slightly over today — a 20-min evening walk will balance it out.`,
        kind: 'activity',
      });
    } else if (overBy <= 500) {
      out.push({
        id: 'over-moderate',
        emoji: '🔄',
        text: `You've exceeded today's target by ${overBy} kcal. Try reducing tomorrow's carbs by one serving to compensate.`,
        kind: 'tip',
      });
    } else {
      out.push({
        id: 'over-high',
        emoji: '📅',
        text: `High calorie day — no stress. Aim for a 200 kcal deficit tomorrow and the day after to balance the week.`,
        kind: 'tip',
      });
    }

    const weeklyNet = input.weekKcalConsumed - input.weekKcalBurned;
    const weeklyTarget = input.targets.kcal * 7;
    if (input.weekDaysLogged >= 3 && weeklyNet <= weeklyTarget) {
      out.push({
        id: 'week-on-track',
        emoji: '✅',
        text: `You're still on track for the week overall — keep it up!`,
        kind: 'tip',
      });
    }

    if (input.hour >= 20) {
      out.push({
        id: 'tomorrow-plan',
        emoji: '🌅',
        text: `For tomorrow, try: light breakfast (~300 kcal), protein lunch (~500 kcal), and skip evening snacks.`,
        kind: 'timing',
      });
    }
  }

  const sorted = [...input.recentEntries].sort(
    (a, b) => Date.parse(b.loggedAt) - Date.parse(a.loggedAt),
  );
  const last = sorted[0];

  if (last) {
    for (const p of PAIRINGS) {
      if (p.match.test(last.description)) {
        out.push({
          id: `pair-${last.id}`,
          emoji: p.emoji,
          text: `Just had ${guessShortName(last.description)}? Pair with ${p.pair} — ${p.reason}.`,
          kind: 'food',
        });
        break;
      }
    }
  }

  if (last) {
    const lastKcal = (last.per100g.kcal * last.grams) / 100;
    const minutesAgo = (Date.now() - Date.parse(last.loggedAt)) / 60000;
    if (lastKcal >= 500 && minutesAgo < 90) {
      const walkMinutes = 10;
      const steps = Math.min(walkMinutes * 100, 2000);
      out.push({
        id: `walk-${last.id}`,
        emoji: '🚶',
        text: `Heavy meal — a ${walkMinutes}-min walk (~${steps.toLocaleString()} steps) helps digestion and blunts the glucose spike.`,
        kind: 'activity',
      });
    }
    if (last.per100g.protein > 25) {
      out.push({
        id: `hydrate-${last.id}`,
        emoji: '💧',
        text: `High-protein meal — drink an extra glass of water to help your kidneys process it.`,
        kind: 'tip',
      });
    }
  }

  if (remainingProtein > 30) {
    out.push({
      id: 'protein-low',
      emoji: '💪',
      text: `${Math.round(remainingProtein)}g protein left today. Greek yogurt, paneer, eggs, or chicken close the gap fast.`,
      kind: 'food',
    });
  }

  if (input.hour >= 14 && remainingFiber > 8) {
    out.push({
      id: 'fiber-low',
      emoji: '🥦',
      text: `${Math.round(remainingFiber)}g fiber to go — a salad, a piece of fruit, or a whole-grain side handles it.`,
      kind: 'food',
    });
  }

  if (input.hour >= 21 && input.totals.kcal < input.targets.kcal * 0.7) {
    out.push({
      id: 'late-eating',
      emoji: '🌙',
      text: `Wrapping up late? Try to finish eating 2–3 hrs before bed — better sleep and easier digestion.`,
      kind: 'timing',
    });
  }

  if (input.recentEntries.length === 0 && input.hour >= 11) {
    out.push({
      id: 'no-food-yet',
      emoji: '🍽️',
      text: `Haven't logged anything yet — even a small breakfast jump-starts your day.`,
      kind: 'tip',
    });
  }

  return out.slice(0, 3);
}
