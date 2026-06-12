export const LANGUAGES = ["en", "ru", "sr"] as const;

export type Language = (typeof LANGUAGES)[number];

export const FALLBACK_LANGUAGE: Language = "en";

// Shown in the language switcher — each name written in its own language.
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ru: "Русский",
  sr: "Srpski",
};

export interface UIStrings {
  menuTitle: string;
  menuCredit: string;
  breathe: string;
  close: string;
  inhale: string;
  hold: string;
  exhale: string;
}

// Typed dictionary: TypeScript guarantees every language has every key.
export const ui: Record<Language, UIStrings> = {
  en: {
    menuTitle: "13 steps out of an emotional flashback",
    menuCredit: "After Pete Walker, “Complex PTSD: From Surviving to Thriving”",
    breathe: "Breathe together",
    close: "Close",
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale",
  },
  ru: {
    menuTitle: "13 шагов из эмоционального флэшбека",
    menuCredit: "По Питу Уокеру, «КПТСР: от выживания к процветанию»",
    breathe: "Подышать вместе",
    close: "Закрыть",
    inhale: "Вдох",
    hold: "Пауза",
    exhale: "Выдох",
  },
  sr: {
    menuTitle: "13 koraka iz emocionalnog flešbeka",
    menuCredit: "Po Pitu Vokeru, „Kompleksni PTSP: od preživljavanja do napredovanja“",
    breathe: "Diši zajedno",
    close: "Zatvori",
    inhale: "Udah",
    hold: "Pauza",
    exhale: "Izdah",
  },
};
