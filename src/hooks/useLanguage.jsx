import { createContext, useContext, useEffect, useState } from "react";
import en from "../content/en.json";
import hi from "../content/hi.json";

const translations = { en, hi };

const LanguageContext = createContext(null);

/**
 * Simple bilingual (EN/HI) language provider.
 * Content is fully data-driven — components never hardcode copy.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("aks-lang") === "hi" ? "hi" : "en";
  });

  useEffect(() => {
    localStorage.setItem("aks-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = {
    lang,
    setLang,
    toggle: () => setLang((l) => (l === "en" ? "hi" : "en")),
    t: translations[lang],
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
