import type { USDANutrients, USDASearchResult } from '@/lib/usda';

export type MacroId = 'protein' | 'carbs' | 'fat';

export const MACRO_COLOR: Record<MacroId, string> = {
  protein: '#00FF87',
  carbs: '#8A5CF6',
  fat: '#FFC857',
};

export type SearchFilter = 'all' | 'high_protein' | 'low_carb' | 'low_fat' | 'high_fiber';

export const FILTER_OPTIONS: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high_protein', label: 'High protein' },
  { value: 'low_carb', label: 'Low carb' },
  { value: 'low_fat', label: 'Low fat' },
  { value: 'high_fiber', label: 'High fiber' },
];

export const SUGGESTION_CHIPS: { emoji: string; label: string; query: string }[] = [
  { emoji: '🍌', label: 'Banana', query: 'banana raw' },
  { emoji: '🍗', label: 'Chicken breast', query: 'chicken breast cooked' },
  { emoji: '🥚', label: 'Eggs', query: 'egg whole raw' },
  { emoji: '🥛', label: 'Milk', query: 'milk whole' },
  { emoji: '🍚', label: 'Rice', query: 'rice white cooked' },
  { emoji: '🥜', label: 'Peanut butter', query: 'peanut butter' },
  { emoji: '🧀', label: 'Paneer', query: 'paneer' },
  { emoji: '🥦', label: 'Broccoli', query: 'broccoli raw' },
];

// Order matters: most specific patterns first.
const EMOJI_PATTERNS: { re: RegExp; emoji: string }[] = [
  { re: /\b(egg|eggs)\b/i, emoji: '🥚' },
  { re: /\b(chicken|turkey|duck)\b/i, emoji: '🍗' },
  { re: /\b(beef|steak|veal|lamb|pork|bacon|ham|sausage|meat)\b/i, emoji: '🥩' },
  {
    re: /\b(fish|salmon|tuna|cod|tilapia|sardine|mackerel|shrimp|prawn|crab|lobster|seafood)\b/i,
    emoji: '🐟',
  },
  { re: /\b(pizza)\b/i, emoji: '🍕' },
  { re: /\b(burger|hamburger)\b/i, emoji: '🍔' },
  { re: /\b(sandwich|wrap|burrito|taco)\b/i, emoji: '🥪' },
  { re: /\b(paneer|cottage cheese|cheese|yogurt|yoghurt|cream|butter)\b/i, emoji: '🧀' },
  { re: /\b(milk|kefir)\b/i, emoji: '🥛' },
  { re: /\b(banana)\b/i, emoji: '🍌' },
  { re: /\b(apple)\b/i, emoji: '🍎' },
  { re: /\b(orange|tangerine|clementine)\b/i, emoji: '🍊' },
  { re: /\b(grape|raisin)\b/i, emoji: '🍇' },
  { re: /\b(strawber|berr|blueber|raspber|blackber)\b/i, emoji: '🍓' },
  { re: /\b(watermelon|melon|cantaloupe)\b/i, emoji: '🍉' },
  { re: /\b(mango|pineapple|kiwi|papaya|peach|pear|plum|cherry|lemon|lime|fruit)\b/i, emoji: '🍎' },
  { re: /\b(broccoli|cauliflower)\b/i, emoji: '🥦' },
  { re: /\b(carrot)\b/i, emoji: '🥕' },
  { re: /\b(potato)\b/i, emoji: '🥔' },
  { re: /\b(tomato)\b/i, emoji: '🍅' },
  { re: /\b(corn|maize)\b/i, emoji: '🌽' },
  { re: /\b(onion|garlic|leek|shallot)\b/i, emoji: '🧅' },
  {
    re: /\b(spinach|kale|lettuce|cabbage|salad|greens|cucumber|zucchini|asparagus|celery|pepper|mushroom|vegetable|veggie)\b/i,
    emoji: '🥗',
  },
  { re: /\b(rice|noodle|pasta|spaghetti|macaroni)\b/i, emoji: '🍚' },
  { re: /\b(bread|toast|bagel|roll|bun|tortilla|chapati|roti|naan)\b/i, emoji: '🍞' },
  { re: /\b(oat|oatmeal|cereal|granola|muesli|wheat|barley|quinoa|flour|grain)\b/i, emoji: '🌾' },
  { re: /\b(almond|peanut|cashew|walnut|pistachio|hazelnut|pecan|nut|seed)\b/i, emoji: '🥜' },
  { re: /\b(bean|lentil|chickpea|dal|legume|tofu|tempeh|soy|edamame)\b/i, emoji: '🫘' },
  { re: /\b(olive|avocado)\b/i, emoji: '🥑' },
  { re: /\b(oil|ghee)\b/i, emoji: '🫒' },
  { re: /\b(cake|cookie|biscuit|brownie|pastry|donut|dessert|pie)\b/i, emoji: '🍰' },
  { re: /\b(chocolate|candy|sweet|sugar|honey|syrup|jam|jelly)\b/i, emoji: '🍫' },
  { re: /\b(ice cream|gelato|sorbet)\b/i, emoji: '🍦' },
  { re: /\b(coffee|espresso|latte|cappuccino)\b/i, emoji: '☕' },
  { re: /\b(tea|chai|matcha)\b/i, emoji: '🍵' },
  { re: /\b(juice|smoothie|drink|soda|cola|beverage)\b/i, emoji: '🥤' },
  { re: /\b(beer|ale|lager)\b/i, emoji: '🍺' },
  { re: /\b(wine|champagne|cocktail|whiskey|vodka|alcohol)\b/i, emoji: '🍷' },
  { re: /\b(water)\b/i, emoji: '💧' },
  { re: /\b(soup|stew|broth)\b/i, emoji: '🍲' },
  { re: /\b(sauce|ketchup|mayo|mustard|dressing|salsa)\b/i, emoji: '🥫' },
  { re: /\b(salt|pepper|spice|herb|cinnamon|cumin)\b/i, emoji: '🧂' },
];

export function foodEmoji(description: string): string {
  for (const { re, emoji } of EMOJI_PATTERNS) {
    if (re.test(description)) return emoji;
  }
  return '🍽️';
}

export function dominantMacro(n: USDANutrients): MacroId {
  const pCal = n.protein * 4;
  const cCal = n.carbs * 4;
  const fCal = n.fat * 9;
  if (pCal >= cCal && pCal >= fCal) return 'protein';
  if (cCal >= fCal) return 'carbs';
  return 'fat';
}

/**
 * USDA occasionally returns nonsensical rows (e.g. a chicken entry showing
 * 61778 kcal/100g, or single-nutrient outliers from data-entry errors).
 * Reject anything physically impossible.
 */
export function isCleanData(r: USDASearchResult): boolean {
  const n = r.per100g;
  if (!Number.isFinite(n.kcal) || n.kcal < 0 || n.kcal > 900) return false;
  for (const v of [n.protein, n.carbs, n.fat, n.fiber]) {
    if (!Number.isFinite(v) || v < 0 || v > 500) return false;
  }
  if (n.protein + n.carbs + n.fat > 130) return false;
  return true;
}

export function applyFilter(r: USDASearchResult, f: SearchFilter): boolean {
  const n = r.per100g;
  switch (f) {
    case 'high_protein':
      return n.protein > 20;
    case 'low_carb':
      return n.carbs < 10;
    case 'low_fat':
      return n.fat < 5;
    case 'high_fiber':
      return n.fiber > 5;
    case 'all':
    default:
      return true;
  }
}

export interface MacroSplit {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export function macroSplit(n: USDANutrients): MacroSplit | null {
  const pCal = n.protein * 4;
  const cCal = n.carbs * 4;
  const fCal = n.fat * 9;
  const total = pCal + cCal + fCal;
  if (total <= 0) return null;
  return {
    proteinPct: (pCal / total) * 100,
    carbsPct: (cCal / total) * 100,
    fatPct: (fCal / total) * 100,
  };
}
