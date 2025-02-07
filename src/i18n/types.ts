export type LanguageCode = string;

export interface TranslationMap {
    [key: string]: string;
}

export interface LanguageMap {
    [key: LanguageCode]: TranslationMap;
}
