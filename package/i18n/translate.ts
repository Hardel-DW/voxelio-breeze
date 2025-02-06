import { i18nInstance } from "@/components/useTranslate";
import type { TranslateTextType } from "@/lib/minecraft/core/schema/primitive/text";

export default function translate(content: TranslateTextType | undefined, replace?: string[]) {
    if (typeof content === "string") {
        return content;
    }

    if (typeof content === "object" && content !== null) {
        if ("type" in content && content.type === "translate" && typeof content.value === "string") {
            let text = i18nInstance.translate(content.value) || content.value;

            const replaceArray = replace || content.replace;
            if (replaceArray) {
                for (const replacement of replaceArray) {
                    text = text.replace("%s", replacement);
                }
            }

            return text;
        }
    }

    if (!content) {
        return null;
    }

    return content.toString();
}
