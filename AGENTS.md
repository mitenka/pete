# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# What this app is

"Pete" — a single-screen Expo app (SDK 56, React Native 0.85, Reanimated 4) presenting Pete Walker's 13 steps for managing a CPTSD emotional flashback as a horizontally paged deck of cards, with a guided breathing exercise, a tap-paced self-compassion flow, and full-screen "my rights" / "my needs" lists. No router, no navigation library, no tests, no lint config.

# Commands

- `npm start` — Expo dev server (`npm run ios` / `android` / `web` to target a platform)
- `npx tsc --noEmit` — typecheck (the only automated check in this repo)

# Architecture

Everything renders from `App.tsx` (`Deck`), which composes three gesture-driven layers:

1. **Card deck** — a paged horizontal `Animated.ScrollView` of 13 `StepCard`s. A single `scrollX` shared value drives per-card parallax/fade (`StepCard`) and the pagination dots, which are both tappable and scrubbable (pan across the dot strip to fling between pages).
2. **Pull-down settings menu** — not a modal; the whole deck translates down via a vertical pan gesture to reveal language/gender controls behind it.
3. **Full-screen overlays** — breathing (step 7), the rights/needs lists (steps 3 and 12, `ListOverlay.tsx`), and the self-compassion flow (step 8, `CompassionFlow.tsx`: three guided breaths, then one phrase per screen advanced by tap at the user's own pace, grouped into captioned stages; behind it a glow that grows and warms from blue to amber with progress and swells past the screen on the ending); deliberately one in-tree `Animated.View`, not a native `Modal` (see comment in `App.tsx`). It mounts only while open so `BreathingCircle`'s/`CompassionFlow`'s timers/haptics stop on close, and the Android hardware back button closes it via `BackHandler`. The breathing rhythm in `BreathingCircle.tsx` is a 4s inhale / 4s hold / 8s exhale loop driven by `setTimeout` chains plus Reanimated shared values. `ListOverlay` draws its own background gradient **vertically** (cards are diagonal) — that keeps its top/bottom scroll-edge fades an exact lerp of the background so they blend seamlessly; the close-button geometry both overlay and fade clearance depend on lives in the `CLOSE_BUTTON_*` constants in `App.tsx`.

Interactions fire `expo-haptics` feedback throughout (page ticks, menu toggle, breath phase changes) — keep that pattern when adding interactions.

# i18n and grammatical gender

This is the part with non-obvious structure, spread across five files:

- `src/data/steps.ts` — `stepMeta` holds language-independent structure (id, gradient pair, optional `overlay` field naming which full-screen overlay — `breathing` / `rights` / `needs` / `compassion` — that card's button opens); `stepText` holds one array of 13 `{title, body[]}` per language, **index-aligned with `stepMeta`**. Translators touch only `stepText`, `overlayLists.ts`, and `compassion.ts`.
- `src/data/overlayLists.ts` — per-language item lists for the rights/needs overlays (currently placeholders). Items pass through the same gender resolver as step text, so `{m|f}` markers work here too.
- `src/data/compassion.ts` — per-language text for the self-compassion flow (intro, captioned stages of phrase slots, ending, tap hint), also gender-resolved. A slot is one fixed phrase or a list of variants; `CompassionFlow` picks one variant per slot when it opens and remembers the picks in AsyncStorage so the next run avoids them. The first slot of each stage is always fixed so every run starts familiar; variant counts must match across languages because the pick is stored as an index.
- `src/i18n/translations.ts` — `LANGUAGES` (en/ru/sr), UI string dictionaries, and the gender system: Russian/Serbian strings embed inline markers like `{обязан|обязана}` (masculine|feminine) which `resolveGender` resolves at render time. English has no markers and the gender control is hidden for it (`GENDERED_LANGUAGES`).
- `src/i18n/LocaleProvider.tsx` — the only consumer-facing surface: `useLocale()` returns UI strings (`t`), the merged + gender-resolved `steps` array, the gender-resolved `overlays` lists, and setters. Language defaults to the device locale synchronously (so the first frame is correct), then AsyncStorage-persisted preferences override a tick later.

To add a language: extend `LANGUAGES`, `LANGUAGE_NAMES`, `GENDER_LABELS`, `ui`, `stepText`, `overlayLists`, and `compassionText`; add it to `GENDERED_LANGUAGES` if it needs the `{m|f}` markers. TypeScript's `Record<Language, …>` types will flag anything missed.

# Tone

Card text addresses a reader in distress in intimate second person ("ты", not "вы", in Russian). Match that register in any new or edited copy.
