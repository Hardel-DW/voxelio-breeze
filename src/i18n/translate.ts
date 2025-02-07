import type { TranslateTextType } from "@/core/schema/primitive/text";
import type { I18n } from "@/i18n/i18n";

export default function translate(instance: I18n, content: TranslateTextType | undefined, replace?: string[]) {
    if (typeof content === "string") {
        return content;
    }

    if (typeof content === "object" && content !== null) {
        if ("type" in content && content.type === "translate" && typeof content.value === "string") {
            let text = instance.translate(content.value) || content.value;

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
