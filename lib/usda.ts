export interface USDANutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface USDASearchResult {
  fdcId: number;
  description: string;
  brand?: string;
  dataType: string;
  per100g: USDANutrients;
}

interface USDAFoodNutrient {
  nutrientId?: number;
  nutrientName?: string;
  value?: number;
  unitName?: string;
  number?: string;
}

interface USDAFoodRaw {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  dataType: string;
  foodNutrients?: USDAFoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

interface USDASearchResponseRaw {
  totalHits: number;
  foods: USDAFoodRaw[];
}

const NUTRIENT_IDS = {
  kcal: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  fiber: 1079,
} as const;

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

function readNutrient(food: USDAFoodRaw, id: number): number {
  const n = food.foodNutrients?.find((x) => x.nutrientId === id);
  return typeof n?.value === 'number' ? n.value : 0;
}

function per100gFromFood(food: USDAFoodRaw): USDANutrients {
  const raw: USDANutrients = {
    kcal: readNutrient(food, NUTRIENT_IDS.kcal),
    protein: readNutrient(food, NUTRIENT_IDS.protein),
    carbs: readNutrient(food, NUTRIENT_IDS.carbs),
    fat: readNutrient(food, NUTRIENT_IDS.fat),
    fiber: readNutrient(food, NUTRIENT_IDS.fiber),
  };
  const serving = food.servingSize;
  const unit = food.servingSizeUnit?.toLowerCase();
  if (
    (food.dataType === 'Branded' || food.dataType === 'Survey (FNDDS)') &&
    serving &&
    serving > 0 &&
    unit === 'g'
  ) {
    const scale = 100 / serving;
    return {
      kcal: raw.kcal * scale,
      protein: raw.protein * scale,
      carbs: raw.carbs * scale,
      fat: raw.fat * scale,
      fiber: raw.fiber * scale,
    };
  }
  return raw;
}

export interface SearchOptions {
  query: string;
  pageSize?: number;
  signal?: AbortSignal;
}

export async function searchFoods({
  query,
  pageSize = 25,
  signal,
}: SearchOptions): Promise<USDASearchResult[]> {
  const apiKey = process.env.EXPO_PUBLIC_USDA_API_KEY;
  if (!apiKey || apiKey.length < 10 || apiKey.startsWith('__PASTE')) {
    throw new Error('Missing EXPO_PUBLIC_USDA_API_KEY. Paste your USDA key into .env and restart with --clear.');
  }
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  // POST with a JSON body. Avoids URL-encoding quirks with `dataType` values
  // that contain spaces and parentheses ("SR Legacy", "Survey (FNDDS)") —
  // those caused 400 Bad Request when repeated as query params.
  const url = `${BASE_URL}/foods/search?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: trimmed,
      pageSize,
      dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'],
    }),
    signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `USDA search failed: ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 160)}` : ''}`,
    );
  }
  const json: USDASearchResponseRaw = await res.json();
  return (json.foods ?? []).map((f) => ({
    fdcId: f.fdcId,
    description: f.description,
    brand: f.brandOwner ?? f.brandName,
    dataType: f.dataType,
    per100g: per100gFromFood(f),
  }));
}
