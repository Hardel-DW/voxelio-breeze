export type TranslationKey = string;
export type LanguageCode = string;

export interface TranslationMap {
    [key: TranslationKey]: string;
}

export interface LanguageMap {
    [key: LanguageCode]: TranslationMap;
}
