# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# What this app is

"Pete" — a single-screen Expo app (SDK 56, React Native 0.85, Reanimated 4) presenting Pete Walker's 13 steps for managing a CPTSD emotional flashback as a horizontally paged deck of cards, with a guided breathing exercise. No router, no navigation library, no tests, no lint config.

# Commands

- `npm start` — Expo dev server (`npm run ios` / `android` / `web` to target a platform)
- `npx tsc --noEmit` — typecheck (the only automated check in this repo)

# Architecture

Everything renders from `App.tsx` (`Deck`), which composes three gesture-driven layers:

1. **Card deck** — a paged horizontal `Animated.ScrollView` of 13 `StepCard`s. A single `scrollX` shared value drives per-card parallax/fade (`StepCard`) and the pagination dots, which are both tappable and scrubbable (pan across the dot strip to fling between pages).
2. **Pull-down settings menu** — not a modal; the whole deck translates down via a vertical pan gesture to reveal language/gender controls behind it.
3. **Breathing overlay** — deliberately an in-tree `Animated.View`, not a native `Modal` (see comment in `App.tsx`); it mounts only while open so `BreathingCircle`'s timers/haptics stop on close. The breathing rhythm in `BreathingCircle.tsx` is a 4s inhale / 4s hold / 8s exhale loop driven by `setTimeout` chains plus Reanimated shared values.

Interactions fire `expo-haptics` feedback throughout (page ticks, menu toggle, breath phase changes) — keep that pattern when adding interactions.

# i18n and grammatical gender

This is the part with non-obvious structure, spread across three files:

- `src/data/steps.ts` — `stepMeta` holds language-independent structure (id, gradient pair, optional `breathing` flag that adds the breathe button to that card); `stepText` holds one array of 13 `{title, body[]}` per language, **index-aligned with `stepMeta`**. Translators touch only `stepText`.
- `src/i18n/translations.ts` — `LANGUAGES` (en/ru/sr), UI string dictionaries, and the gender system: Russian/Serbian strings embed inline markers like `{обязан|обязана}` (masculine|feminine) which `resolveGender` resolves at render time. English has no markers and the gender control is hidden for it (`GENDERED_LANGUAGES`).
- `src/i18n/LocaleProvider.tsx` — the only consumer-facing surface: `useLocale()` returns UI strings (`t`), the merged + gender-resolved `steps` array, and setters. Language defaults to the device locale synchronously (so the first frame is correct), then AsyncStorage-persisted preferences override a tick later.

To add a language: extend `LANGUAGES`, `LANGUAGE_NAMES`, `GENDER_LABELS`, `ui`, and `stepText`; add it to `GENDERED_LANGUAGES` if it needs the `{m|f}` markers. TypeScript's `Record<Language, …>` types will flag anything missed.

# Tone

Card text addresses a reader in distress in intimate second person ("ты", not "вы", in Russian). Match that register in any new or edited copy.
