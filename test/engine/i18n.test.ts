import { I18n } from "@/i18n/i18n";
import { type TranslationKey, translations } from "@/i18n/translations";
import type { LanguageCode } from "@/i18n/types";
import { describe, it, beforeEach, expect } from "vitest";

const FRENCH_LANG = "fr-fr";
const ENGLISH_LANG = "en-us";

describe("I18n", () => {
    let i18n: I18n;

    beforeEach(() => {
        i18n = new I18n();
    });

    describe("constructor", () => {
        it("should initialize with default language (en)", () => {
            expect(i18n.getLanguage()).toBe(ENGLISH_LANG);
        });

        it("should initialize with specified language", () => {
            const frI18n = new I18n(FRENCH_LANG);
            expect(frI18n.getLanguage()).toBe(FRENCH_LANG);
        });

        it("should initialize with default language if no language is specified", () => {
            const frI18n = new I18n(undefined);
            expect(frI18n.getLanguage()).toBe(ENGLISH_LANG);
        });

        it("should initialize with default language if no language is specified", () => {
            // @ts-expect-error
            const frI18n = new I18n(null);
            expect(frI18n.getLanguage()).toBe(ENGLISH_LANG);
        });
    });

    describe("setLanguage", () => {
        it("should change the current language", () => {
            i18n.setLanguage(FRENCH_LANG);
            expect(i18n.getLanguage()).toBe(FRENCH_LANG);
        });

        it("should not change language if invalid language code is provided", () => {
            i18n.setLanguage("invalid" as LanguageCode);
            expect(i18n.getLanguage()).toBe(ENGLISH_LANG);
        });
    });

    describe("translate", () => {
        it("should translate a simple key", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.save")).toBe("Save");
        });

        it("should translate with parameters", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.hello", { args: ["World"] })).toBe("Hello World");
        });

        it("should translate with multiple parameters", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.welcome", { args: ["John", "morning"] })).toBe("Welcome John, good morning");
        });

        it("should fallback to English if translation is missing in current language", () => {
            i18n.setLanguage(FRENCH_LANG);
            const nonExistentKey = "generic.nonexistent" as TranslationKey;
            expect(i18n.translate(nonExistentKey)).toBe(translations[ENGLISH_LANG]["generic.missing_key"]);
        });

        it("should handle missing parameters by keeping %s", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.hello")).toBe("Hello %s");
        });

        it("should handle extra parameters by ignoring them", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.hello", { args: ["World", "extra"] })).toBe("Hello World");
        });

        it("should handle undefined parameters", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.hello", { args: undefined })).toBe("Hello %s");
        });

        it("should handle null parameters", () => {
            i18n.setLanguage(ENGLISH_LANG);
            // @ts-expect-error
            expect(i18n.translate("generic.hello", { args: null })).toBe("Hello %s");
        });
    });

    describe("language switching", () => {
        it("should correctly switch between languages", () => {
            i18n.setLanguage(ENGLISH_LANG);
            const enTranslation = i18n.translate("generic.save");

            i18n.setLanguage(FRENCH_LANG);
            const frTranslation = i18n.translate("generic.save");

            expect(enTranslation).toBe("Save");
            expect(frTranslation).toBe("Sauvegarder");
            expect(enTranslation).not.toBe(frTranslation);
        });

        it("should maintain translations after multiple language switches", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.save")).toBe("Save");

            i18n.setLanguage(FRENCH_LANG);
            expect(i18n.translate("generic.save")).toBe("Sauvegarder");

            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.save")).toBe("Save");
        });
    });

    describe("edge cases", () => {
        it("should handle nested translation keys", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("tools.enchantments.home")).toBe("Enchantment Configurator");
        });

        it("should handle numeric parameters", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.count", { args: [42] })).toBe("Count: 42");
        });

        it("should handle empty string parameters", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.hello", { args: [""] })).toBe("Hello ");
        });
    });

    describe("format method behavior", () => {
        it("should handle consecutive placeholders", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.consecutive", { args: ["a", "b"] })).toBe("a b");
        });

        it("should handle placeholders at start and end", () => {
            i18n.setLanguage(ENGLISH_LANG);
            expect(i18n.translate("generic.borders", { args: ["start", "end"] })).toBe("start text end");
        });

        it("should preserve special characters in translation", () => {
            i18n.setLanguage(ENGLISH_LANG);
            const specialKey = "generic.special" as TranslationKey;
            expect(i18n.translate(specialKey)).toContain("!");
            expect(i18n.translate(specialKey)).toContain("?");
            expect(i18n.translate(specialKey)).toContain(".");
        });
    });

    describe("fallback behavior", () => {
        it("should fallback to English for unsupported languages", () => {
            i18n.setLanguage("xx" as LanguageCode);
            expect(i18n.translate("generic.save")).toBe("Save");
        });

        it("should fallback to English for partially translated languages", () => {
            i18n.setLanguage(FRENCH_LANG);
            const partialKey = "generic.not_existing" as TranslationKey;
            expect(i18n.translate(partialKey)).toBe(translations[ENGLISH_LANG]["generic.missing_key"]);
        });

        it("should use English missing key message when key doesn't exist in any language", () => {
            i18n.setLanguage(FRENCH_LANG);
            const nonExistentKey = "totally.nonexistent.key" as TranslationKey;
            expect(i18n.translate(nonExistentKey)).toBe(translations[ENGLISH_LANG]["generic.missing_key"]);
        });
    });

    describe("performance considerations", () => {
        it("should handle large numbers of translations efficiently", () => {
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                i18n.translate("generic.save");
            }
            const end = performance.now();
            expect(end - start).toBeLessThan(100); // devrait prendre moins de 100ms
        });

        it("should handle rapid language switching", () => {
            const languages: LanguageCode[] = [ENGLISH_LANG, FRENCH_LANG];
            const start = performance.now();
            for (let i = 0; i < 100; i++) {
                i18n.setLanguage(languages[i % 2]);
                i18n.translate("generic.save");
            }
            const end = performance.now();
            expect(end - start).toBeLessThan(50); // devrait prendre moins de 50ms
        });
    });
});
