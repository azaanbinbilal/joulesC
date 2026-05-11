# joulesC

> Smart calories, honest goals. A privacy-first calorie tracker that tells you whether your weight goal is actually healthy — not just possible.

**Status:** Phase 1 of 6 — profile onboarding + calorie-target math is live. Food logging, photo recognition (via Gemini), and the goal-progress graph land in later phases.

## What it does (today)

- Onboarding flow: name, age, sex, weight, height, activity level — in metric or imperial
- Goal flow: lose / maintain / gain, with target weight + deadline
- Computes BMR (Mifflin–St Jeor), TDEE, BMI, and a personalized daily calorie target
- **Feasibility check** that flags aggressive or unsafe goals and suggests a sustainable timeline
- Local-first: data stays on your device via `AsyncStorage`

## Stack

- Expo SDK 54 (React Native 0.81, React 19) with Expo Router 6 (typed routes)
- NativeWind 4 (Tailwind for RN) with a custom dark-neon palette
- Zustand for state, persisted to AsyncStorage
- TypeScript strict mode

## Setup

```bash
# 1. install deps (already done if you scaffolded fresh)
npm install

# 2. copy env template and paste your keys locally
cp .env.example .env
# then edit .env — see "API keys" below
```

### API keys

Two keys live in `.env` (which is gitignored — never commit it):

| Var | Get it from | Used for |
|---|---|---|
| `EXPO_PUBLIC_GEMINI_API_KEY` | https://aistudio.google.com/apikey | Photo → food recognition (Phase 4) |
| `EXPO_PUBLIC_USDA_API_KEY` | https://fdc.nal.usda.gov/api-key-signup | Text food search (Phase 2) |

> ⚠️ `EXPO_PUBLIC_*` vars ship inside the client bundle. For public releases, the Gemini key should be moved to a Supabase Edge Function proxy. See `docs/security.md` (TODO).

## Run

```bash
npm run web        # http://localhost:8081
npm run android    # opens on a connected device or emulator
npm start          # interactive picker (scan QR with Expo Go)
```

## Project layout

```
app/                      Expo Router screens
  (onboarding)/           First-launch flow
  (tabs)/                 Main app after onboarding
components/               Shared UI (Screen, NeonButton, StatInput, ...)
lib/health.ts             BMR/TDEE/feasibility math
lib/units.ts              kg/lb, cm/ft+in conversions
store/profile.ts          Persisted profile + goal
store/onboarding.ts       Onboarding draft (in-memory)
types/profile.ts          Profile shape
```

## Roadmap

- [x] **Phase 1** — Profile + goal math + onboarding UI
- [ ] **Phase 2** — Food log via USDA, daily macro dashboard
- [ ] **Phase 3** — Goal-progress graph, manual activity (MET tables), hydration, streaks
- [ ] **Phase 4** — Gemini Vision photo → food (via Supabase Edge Function proxy)
- [ ] **Phase 5** — Meal-timing coach, pre-workout content, fun facts engine
- [ ] **Phase 6** — Vercel web deploy + GitHub Action publishing APK to Releases

## Distribution

When v1 ships:

- **Web** at `joulesc.vercel.app` (TBD)
- **Android APK** attached to the latest [GitHub Release](https://github.com/azaanbinbilal/joulesC/releases) — sideload onto any Android phone, no Play Store

No iOS build — by design.

## Disclaimer

joulesC offers general fitness guidance, not medical advice. Talk to a healthcare professional before making significant dietary or training changes.
