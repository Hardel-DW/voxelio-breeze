import type { TranslationKey } from "@/lib/minecraft/i18n/translations";

export class DatapackError extends Error {
    constructor(message: TranslationKey) {
        super(message);
        this.name = "DatapackError";
    }
}
