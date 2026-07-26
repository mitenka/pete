export const LANGUAGES = ["en", "ru", "sr"] as const;

export type Language = (typeof LANGUAGES)[number];

export const FALLBACK_LANGUAGE: Language = "en";

// Shown in the language switcher — each name written in its own language.
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ru: "Русский",
  sr: "Srpski",
};

// Grammatical gender for verb/adjective agreement in Russian and Serbian.
// English is genderless, so the gender control is hidden there.
export type Gender = "m" | "f";

export const GENDERS = ["m", "f"] as const;

export const DEFAULT_GENDER: Gender = "f";

const GENDERED_LANGUAGES: ReadonlySet<Language> = new Set(["ru", "sr"]);

export function isGendered(lang: Language): boolean {
  return GENDERED_LANGUAGES.has(lang);
}

// Two-letter-ish labels shown in the gender segmented control, per language.
export const GENDER_LABELS: Record<Language, Record<Gender, string>> = {
  en: { m: "M", f: "F" },
  ru: { m: "М", f: "Ж" },
  sr: { m: "M", f: "Ž" },
};

// Resolves inline gender markers like "{обязан|обязана}" to the masculine
// (first) or feminine (second) form. Text without markers passes through
// unchanged, so English strings are unaffected.
export function resolveGender(text: string, gender: Gender): string {
  return text.replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_, masc, fem) =>
    gender === "m" ? masc : fem,
  );
}

export interface UIStrings {
  menuTitle: string;
  menuCredit: string;
  breathe: string;
  rightsButton: string;
  needsButton: string;
  close: string;
  inhale: string;
  hold: string;
  exhale: string;
  // Screen-reader only. stepOf contains {n} and {total} placeholders.
  stepOf: string;
  masculine: string;
  feminine: string;
  settings: string;
}

// Typed dictionary: TypeScript guarantees every language has every key.
export const ui: Record<Language, UIStrings> = {
  en: {
    menuTitle: "13 steps out of an emotional flashback",
    menuCredit: "After Pete Walker, “Complex PTSD: From Surviving to Thriving”",
    breathe: "Breathe together",
    rightsButton: "My rights",
    needsButton: "My needs",
    close: "Close",
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale",
    stepOf: "Step {n} of {total}",
    masculine: "Masculine",
    feminine: "Feminine",
    settings: "Settings",
  },
  ru: {
    menuTitle: "13 шагов из эмоционального флэшбека",
    menuCredit: "По Питу Уокеру, «КПТСР: от выживания к процветанию»",
    breathe: "Подышать вместе",
    rightsButton: "Мои права",
    needsButton: "Мои потребности",
    close: "Закрыть",
    inhale: "Вдох",
    hold: "Пауза",
    exhale: "Выдох",
    stepOf: "Шаг {n} из {total}",
    masculine: "Мужской род",
    feminine: "Женский род",
    settings: "Настройки",
  },
  sr: {
    menuTitle: "13 koraka iz emocionalnog flešbeka",
    menuCredit: "Po Pitu Vokeru, „Kompleksni PTSP: od preživljavanja do napredovanja“",
    breathe: "Diši zajedno",
    rightsButton: "Moja prava",
    needsButton: "Moje potrebe",
    close: "Zatvori",
    inhale: "Udah",
    hold: "Pauza",
    exhale: "Izdah",
    stepOf: "Korak {n} od {total}",
    masculine: "Muški rod",
    feminine: "Ženski rod",
    settings: "Podešavanja",
  },
};
