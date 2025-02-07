import { checkCondition } from "@/core/engine/condition/index";
import type { Lock, LockRenderer } from "@/core/schema/primitive/component";

export function checkLocks(locks: Lock[] | undefined, element: Record<string, unknown>): LockRenderer {
    if (!locks) return { isLocked: false };

    for (const lock of locks) {
        if (checkCondition(lock.condition, element)) {
            return { isLocked: true, text: lock.text };
        }
    }

    return { isLocked: false };
}
