import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

export interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, ar: string) => string;
  dir: "ltr" | "rtl";
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to 'en'
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem("app_language");
    console.log('📦 TranslationProvider initializing, saved language:', saved);
    return (saved === "ar" ? "ar" : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    console.log('🌐 REAL SETLANGUAGE CALLED! Setting to:', lang);
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
    // Update HTML dir attribute
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    console.log('✅ Language changed to:', lang);
  };

  const t = (en: string, ar: string) => {
    return language === "ar" ? ar : en;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  // Set initial direction and mark as ready
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    setIsReady(true);
    console.log('🎨 TranslationProvider mounted, language:', language, 'READY!');
  }, []);
  
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const value: TranslationContextType = { language, setLanguage, t, dir };

  console.log('🔄 TranslationProvider rendering, isReady:', isReady, 'language:', language);

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

// Export the hook from the same file to avoid Fast Refresh issues
export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  
  if (!context) {
    // Provider not initialized - return safe defaults
    console.error('❌ TranslationProvider not found! Using defaults.');
    return {
      language: "en",
      setLanguage: () => console.error('❌ No provider!'),
      t: (en: string) => en,
      dir: "ltr",
    };
  }
  
  console.log('✅ useTranslation - got real context, setLanguage:', context.setLanguage.name);
  return context;
}
