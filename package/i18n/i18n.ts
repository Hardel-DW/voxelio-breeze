import { translations } from "./translations.ts";
import type { LanguageCode, TranslationKey } from "./types.ts";

export class I18n {
    private currentLanguage: LanguageCode = "en-us";
    private fallbackLanguage: LanguageCode = "en-us";

    constructor(lang: LanguageCode = "en-us") {
        if (!lang) {
            this.currentLanguage = "en-us";
            return;
        }

        this.currentLanguage = lang;
    }

    /**
     * Définit la langue courante
     */
    public setLanguage(lang: LanguageCode): void {
        if (translations[lang]) {
            this.currentLanguage = lang;
        }
    }

    /**
     * Obtient une traduction
     * @example
     * i18n.translate('hello %s comment tu vas %s', 'John', 'aujourdhui')
     * // => "Bonjour John comment tu vas aujourdhui"
     */
    public translate(key: TranslationKey, options?: { lang?: LanguageCode; args?: (string | number)[] }): string {
        const lang = options?.lang ?? this.currentLanguage;
        const args = options?.args ?? [];

        let translation = translations[lang]?.[key];
        if (!translation) {
            translation = translations[this.fallbackLanguage]?.[key];
        }

        if (!translation) {
            return translations[this.fallbackLanguage]["generic.missing_key"];
        }

        // Remplace les %s par les arguments
        return this.format(translation, ...args);
    }

    /**
     * Formate une chaîne en remplaçant les %s par les arguments
     */
    private format(text: string, ...args: (string | number)[]): string {
        return text.replace(/%s/g, () => String(args.shift() ?? "%s"));
    }

    /**
     * Obtient la langue courante
     */
    public getLanguage(): LanguageCode {
        return this.currentLanguage;
    }
}
