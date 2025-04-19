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
