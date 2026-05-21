export interface ServingPreset {
  label: string;
  grams: number;
}

const PRESET_RULES: { match: RegExp; presets: ServingPreset[] }[] = [
  {
    match: /\begg/i,
    presets: [
      { label: '1 egg', grams: 50 },
      { label: '2 eggs', grams: 100 },
      { label: '3 eggs', grams: 150 },
    ],
  },
  {
    match: /\b(milk|kefir|buttermilk)\b/i,
    presets: [
      { label: '1 tbsp', grams: 15 },
      { label: '1 glass', grams: 240 },
      { label: '1 cup', grams: 240 },
    ],
  },
  {
    match: /\b(yogurt|yoghurt|curd)\b/i,
    presets: [
      { label: '1/2 cup', grams: 120 },
      { label: '1 cup', grams: 245 },
      { label: '1 bowl', grams: 200 },
    ],
  },
  {
    match: /\bpaneer\b/i,
    presets: [
      { label: '1 cube', grams: 30 },
      { label: '50g', grams: 50 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    match: /\b(cheese)\b/i,
    presets: [
      { label: '1 slice', grams: 28 },
      { label: '1 oz', grams: 28 },
      { label: '50g', grams: 50 },
    ],
  },
  {
    match: /\b(rice|noodle|pasta|spaghetti|macaroni|quinoa)\b/i,
    presets: [
      { label: '1/2 cup cooked', grams: 100 },
      { label: '1 cup cooked', grams: 195 },
      { label: '1 plate', grams: 250 },
    ],
  },
  {
    match: /\b(bread|toast|bagel|roll|bun)\b/i,
    presets: [
      { label: '1 slice', grams: 30 },
      { label: '2 slices', grams: 60 },
    ],
  },
  {
    match: /\b(roti|chapati|naan|tortilla)\b/i,
    presets: [
      { label: '1 piece', grams: 40 },
      { label: '2 pieces', grams: 80 },
    ],
  },
  {
    match: /\bchicken\b/i,
    presets: [
      { label: '1/2 breast', grams: 85 },
      { label: '1 breast', grams: 170 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    match: /\b(beef|steak|pork|lamb)\b/i,
    presets: [
      { label: '1 oz', grams: 28 },
      { label: '100g', grams: 100 },
      { label: '1 steak', grams: 200 },
    ],
  },
  {
    match: /\b(fish|salmon|tuna|cod|tilapia)\b/i,
    presets: [
      { label: '1 fillet', grams: 130 },
      { label: '100g', grams: 100 },
      { label: '1 can', grams: 165 },
    ],
  },
  {
    match: /\bbanana\b/i,
    presets: [
      { label: '1 small', grams: 90 },
      { label: '1 medium', grams: 118 },
      { label: '1 large', grams: 140 },
    ],
  },
  {
    match: /\b(apple|pear|orange)\b/i,
    presets: [
      { label: '1 small', grams: 130 },
      { label: '1 medium', grams: 180 },
      { label: '1 large', grams: 220 },
    ],
  },
  {
    match: /\b(berry|berries|strawberry|blueberry|raspberry|blackberry)\b/i,
    presets: [
      { label: '1/2 cup', grams: 75 },
      { label: '1 cup', grams: 150 },
    ],
  },
  {
    match: /\b(grape|grapes)\b/i,
    presets: [
      { label: '1 handful', grams: 80 },
      { label: '1 cup', grams: 150 },
    ],
  },
  {
    match: /\b(peanut butter|almond butter|nut butter)\b/i,
    presets: [
      { label: '1 tsp', grams: 5 },
      { label: '1 tbsp', grams: 16 },
      { label: '2 tbsp', grams: 32 },
    ],
  },
  {
    match: /\b(almond|cashew|walnut|pistachio|peanut|nuts)\b/i,
    presets: [
      { label: '1 handful', grams: 28 },
      { label: '1/4 cup', grams: 35 },
      { label: '50g', grams: 50 },
    ],
  },
  {
    match: /\b(avocado)\b/i,
    presets: [
      { label: '1/2 avocado', grams: 100 },
      { label: '1 whole', grams: 200 },
    ],
  },
  {
    match: /\b(oil|olive oil|coconut oil|ghee|butter)\b/i,
    presets: [
      { label: '1 tsp', grams: 5 },
      { label: '1 tbsp', grams: 14 },
    ],
  },
  {
    match: /\b(oat|oatmeal|cereal|granola|muesli)\b/i,
    presets: [
      { label: '1/2 cup', grams: 40 },
      { label: '1 cup', grams: 80 },
      { label: '1 bowl', grams: 60 },
    ],
  },
  {
    match: /\b(broccoli|cauliflower|spinach|kale|salad)\b/i,
    presets: [
      { label: '1 cup', grams: 90 },
      { label: '1 bowl', grams: 150 },
    ],
  },
  {
    match: /\b(potato)\b/i,
    presets: [
      { label: '1 small', grams: 150 },
      { label: '1 medium', grams: 210 },
      { label: '1 large', grams: 300 },
    ],
  },
  {
    match: /\b(juice|smoothie|soda|drink|beverage)\b/i,
    presets: [
      { label: '1 cup', grams: 240 },
      { label: '1 glass', grams: 240 },
      { label: '1 bottle', grams: 500 },
    ],
  },
  {
    match: /\b(coffee|tea|chai|espresso|latte)\b/i,
    presets: [
      { label: '1 cup', grams: 240 },
      { label: '1 mug', grams: 350 },
    ],
  },
];

const DEFAULT_PRESETS: ServingPreset[] = [
  { label: '50g', grams: 50 },
  { label: '100g', grams: 100 },
  { label: '150g', grams: 150 },
  { label: '200g', grams: 200 },
  { label: '250g', grams: 250 },
];

const HUNDRED_PRESET: ServingPreset = { label: '100g', grams: 100 };

export function getServingPresets(description: string): ServingPreset[] {
  for (const rule of PRESET_RULES) {
    if (rule.match.test(description)) {
      const hasHundred = rule.presets.some((p) => p.grams === 100);
      return hasHundred ? rule.presets : [...rule.presets, HUNDRED_PRESET];
    }
  }
  return DEFAULT_PRESETS;
}

export function findMatchingPreset(
  presets: ServingPreset[],
  grams: number,
): ServingPreset | null {
  return presets.find((p) => p.grams === grams) ?? null;
}
