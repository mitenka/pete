import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import {
  DEFAULT_GENDER,
  FALLBACK_LANGUAGE,
  GENDERS,
  LANGUAGES,
  isGendered,
  resolveGender,
  ui,
  type Gender,
  type Language,
  type UIStrings,
} from "./translations";
import { stepMeta, stepText, type Step } from "../data/steps";
import { overlayLists, type OverlayList } from "../data/overlayLists";

const STORAGE_KEY_LANGUAGE = "app.language";
const STORAGE_KEY_GENDER = "app.gender";

function isSupported(value: string | null | undefined): value is Language {
  return !!value && (LANGUAGES as readonly string[]).includes(value);
}

function isGenderValue(value: string | null | undefined): value is Gender {
  return !!value && (GENDERS as readonly string[]).includes(value);
}

// Walk the user's ordered device locales and pick the first one we ship.
// Falls back to English if none match.
function detectDeviceLanguage(): Language {
  for (const locale of getLocales()) {
    if (isSupported(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
}

interface LocaleContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  gender: Gender;
  setGender: (gender: Gender) => void;
  // Whether the current language has grammatical gender (controls UI visibility).
  gendered: boolean;
  t: UIStrings;
  steps: Step[];
  overlays: Record<"rights" | "needs", OverlayList>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Start from the device language synchronously, so the first frame is already
  // in the right language. A saved preference (if any) is applied a tick later.
  const [language, setLanguageState] = useState<Language>(detectDeviceLanguage);
  // Gender can't be detected from the device, so it starts at the default and
  // is overridden by a saved preference if one exists.
  const [gender, setGenderState] = useState<Gender>(DEFAULT_GENDER);

  useEffect(() => {
    let active = true;
    // If storage is unavailable the device-detected defaults simply stay.
    AsyncStorage.multiGet([STORAGE_KEY_LANGUAGE, STORAGE_KEY_GENDER])
      .then(([[, storedLang], [, storedGender]]) => {
        if (!active) return;
        if (isSupported(storedLang)) setLanguageState(storedLang);
        if (isGenderValue(storedGender)) setGenderState(storedGender);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const setLanguage = (lang: Language) => {
      setLanguageState(lang);
      AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, lang).catch(() => {});
    };
    const setGender = (g: Gender) => {
      setGenderState(g);
      AsyncStorage.setItem(STORAGE_KEY_GENDER, g).catch(() => {});
    };
    const g = (text: string) => resolveGender(text, gender);
    return {
      language,
      setLanguage,
      gender,
      setGender,
      gendered: isGendered(language),
      t: ui[language],
      steps: stepMeta.map((meta, i) => {
        const text = stepText[language][i];
        return {
          ...meta,
          title: g(text.title),
          body: text.body.map(g),
        };
      }),
      overlays: {
        rights: { items: overlayLists[language].rights.items.map(g) },
        needs: { items: overlayLists[language].needs.items.map(g) },
      },
    };
  }, [language, gender]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
