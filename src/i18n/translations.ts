import type { TranslateTextType } from "@/core/schema/primitive/text";
import { english } from "@/i18n/lang/en";
import { french } from "@/i18n/lang/fr";
import type { LanguageMap } from "@/i18n/types";

export function getKey(content: TranslateTextType | undefined): string {
    if (!content) {
        return "";
    }

    if (typeof content === "string") {
        return content;
    }

    if (typeof content === "object") {
        if ("type" in content && content.type === "translate") {
            return content.value;
        }
    }

    return content.toString();
}

export type TranslationKey = keyof typeof english;
export const translations: LanguageMap = {
    "en-us": english,
    "fr-fr": french
};
