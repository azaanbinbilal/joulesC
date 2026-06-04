// Supabase Edge Function: gemini-vision-food
//
// Accepts a base64-encoded food photo, calls Gemini 2.5 Flash with a strict
// JSON response schema, and returns a list of detected items with portion
// estimates and macros per 100 g.
//
// The Gemini API key is read from the GEMINI_API_KEY secret. The client only
// sees the Supabase URL + anon key, so the key never ships in the app bundle.

// deno-lint-ignore-file no-explicit-any

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-2.5-flash';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const PROMPT = `You are a nutrition expert analyzing a food photo.

Identify each visually distinct food item in the image. Ignore plates,
utensils, drinks unless the drink is the meal. For each item return:

- name: short, specific name (e.g. "grilled chicken breast", "white rice")
- estimatedGrams: best guess of the visible portion weight in grams
- per100g: macros per 100 g (kcal, protein, carbs, fat, fiber)
- confidence: 0..1 indicating how sure you are

If no food is visible, return { "items": [] }.
Do not include any commentary outside the JSON.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          estimatedGrams: { type: 'number' },
          per100g: {
            type: 'object',
            properties: {
              kcal: { type: 'number' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' },
              fiber: { type: 'number' },
            },
            required: ['kcal', 'protein', 'carbs', 'fat', 'fiber'],
          },
          confidence: { type: 'number' },
        },
        required: ['name', 'estimatedGrams', 'per100g', 'confidence'],
      },
    },
  },
  required: ['items'],
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!GEMINI_API_KEY) {
    return json({ error: 'Server misconfigured: GEMINI_API_KEY missing' }, 500);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const imageBase64: unknown = body?.imageBase64;
  const mimeType: string = typeof body?.mimeType === 'string' ? body.mimeType : 'image/jpeg';

  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
    return json({ error: 'Missing imageBase64' }, 400);
  }
  if (imageBase64.length > 8_000_000) {
    return json({ error: 'Image too large - keep it under ~6MB encoded' }, 413);
  }

  const geminiBody = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });
  } catch (e) {
    return json({ error: 'Gemini request failed', detail: String(e).slice(0, 300) }, 502);
  }

  if (!geminiRes.ok) {
    const text = await geminiRes.text().catch(() => '');
    return json(
      {
        error: `Gemini error ${geminiRes.status}`,
        detail: text.slice(0, 500),
      },
      502,
    );
  }

  const geminiJson: any = await geminiRes.json();
  const textOut: string | undefined =
    geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOut) {
    return json({ error: 'Empty Gemini response' }, 502);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(textOut);
  } catch {
    return json({ error: 'Gemini returned non-JSON text', detail: textOut.slice(0, 300) }, 502);
  }
  if (!parsed || !Array.isArray(parsed.items)) {
    return json({ error: 'Gemini response missing items[]' }, 502);
  }

  return json(parsed);
});
