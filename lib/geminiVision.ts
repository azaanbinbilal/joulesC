import { requireSupabaseConfig } from '@/lib/supabase';

const FUNCTION_NAME = 'gemini-vision-food';

export interface VisionFoodItem {
  name: string;
  estimatedGrams: number;
  per100g: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  confidence: number;
}

export interface VisionResult {
  items: VisionFoodItem[];
}

interface AnalyzeOptions {
  imageBase64: string;
  mimeType?: string;
  signal?: AbortSignal;
}

function isVisionFoodItem(x: unknown): x is VisionFoodItem {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (typeof o.name !== 'string') return false;
  if (typeof o.estimatedGrams !== 'number') return false;
  if (typeof o.confidence !== 'number') return false;
  const p = o.per100g as Record<string, unknown> | undefined;
  if (!p || typeof p !== 'object') return false;
  return (
    typeof p.kcal === 'number' &&
    typeof p.protein === 'number' &&
    typeof p.carbs === 'number' &&
    typeof p.fat === 'number' &&
    typeof p.fiber === 'number'
  );
}

function extractServerMessage(rawBody: string): string {
  try {
    const j = JSON.parse(rawBody);
    if (j && typeof j === 'object') {
      const obj = j as Record<string, unknown>;
      const parts: string[] = [];
      if (typeof obj.error === 'string') parts.push(obj.error);
      else if (typeof obj.message === 'string') parts.push(obj.message);
      if (typeof obj.detail === 'string') parts.push(obj.detail);
      if (parts.length > 0) return parts.join(' - ');
    }
  } catch {
    /* not JSON */
  }
  return rawBody.slice(0, 400);
}

export async function analyzeFoodPhoto({
  imageBase64,
  mimeType,
  signal,
}: AnalyzeOptions): Promise<VisionResult> {
  const { url, anonKey } = requireSupabaseConfig();
  const fnUrl = `${url}/functions/v1/${FUNCTION_NAME}`;

  if (__DEV__) {
    console.log('[geminiVision] POST', fnUrl, 'imageBytes:', imageBase64.length);
  }

  let res: Response;
  try {
    res = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Both headers are sent because the Supabase functions gateway uses
        // `apikey` for routing/quota and the Edge Runtime checks
        // `Authorization` when verify_jwt is enabled. Sending both lets the
        // same client code work regardless of the function's verify_jwt
        // setting.
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ imageBase64, mimeType: mimeType ?? 'image/jpeg' }),
      signal,
    });
  } catch (e) {
    throw new Error(
      `Could not reach Supabase function at ${fnUrl}: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }

  const rawBody = await res.text().catch(() => '');

  if (__DEV__) {
    console.log('[geminiVision] response', res.status, rawBody.slice(0, 500));
  }

  if (!res.ok) {
    const detail = extractServerMessage(rawBody);
    throw new Error(`Vision function ${res.status}: ${detail || res.statusText}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new Error(`Vision function returned non-JSON: ${rawBody.slice(0, 200)}`);
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { items?: unknown }).items)) {
    throw new Error('Vision response was malformed (missing items array).');
  }

  const items = (parsed as { items: unknown[] }).items.filter(isVisionFoodItem);
  return { items };
}
