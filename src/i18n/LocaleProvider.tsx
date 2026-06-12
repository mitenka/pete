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
  FALLBACK_LANGUAGE,
  LANGUAGES,
  ui,
  type Language,
  type UIStrings,
} from "./translations";
import { stepMeta, stepText, type Step } from "../data/steps";

const STORAGE_KEY = "app.language";

function isSupported(value: string | null | undefined): value is Language {
  return !!value && (LANGUAGES as readonly string[]).includes(value);
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
  t: UIStrings;
  steps: Step[];
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Start from the device language synchronously, so the first frame is already
  // in the right language. A saved preference (if any) is applied a tick later.
  const [language, setLanguageState] = useState<Language>(detectDeviceLanguage);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (active && isSupported(stored)) setLanguageState(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const setLanguage = (lang: Language) => {
      setLanguageState(lang);
      AsyncStorage.setItem(STORAGE_KEY, lang);
    };
    return {
      language,
      setLanguage,
      t: ui[language],
      steps: stepMeta.map((meta, i) => ({ ...meta, ...stepText[language][i] })),
    };
  }, [language]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
