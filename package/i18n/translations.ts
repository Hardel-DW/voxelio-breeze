import type { TranslateTextType } from "../core/schema/primitive/text.ts";
import { english } from "./lang/en.ts";
import { french } from "./lang/fr.ts";
import type { LanguageMap } from "./types.ts";

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
