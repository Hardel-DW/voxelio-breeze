import type { TranslateTextType } from "@/core/schema/primitive/text";

/**
 * This functions search recursively in an object and return all i18n keys, you can localize it with the pattern :
 * export type InternalTranslateType = {
 *     type: "translate";
 *     value: string;
 *     replace?: string[];
 * };
 */
export function getI18nKeys(obj: object): string[] {
    const keys: string[] = [];

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            if (typeof value === "string") {
                keys.push(value);
            } else if (typeof value === "object" && value !== null) {
                keys.push(...getI18nKeys(value));
            }
        }
    }

    return keys;
}

/**
 * Get the key from a TranslateTextType object
 * @param content - The TranslateTextType object to get the key from
 * @returns The key from the TranslateTextType object
 */
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
