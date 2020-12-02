import React from "react";

enum Language {
  de,
  en,
}

const TranslationContext = React.createContext<Language>(Language.de);

interface TranslationInput<T> {
  de: T,
  en: T,
}

export type TranslationFunction = <T>(i: TranslationInput<T>) => T;

function useTranslation(): TranslationFunction {
  const ctx = React.useContext(TranslationContext);

  return i => {
    switch (ctx) {
      case Language.de:
        return i.de;
      case Language.en:
        return i.en;
    }
  }
}

export {useTranslation, TranslationContext, Language};
