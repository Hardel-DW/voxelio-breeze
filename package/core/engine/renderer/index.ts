import { checkCondition } from "../condition/index.ts";
import type { Lock, LockRenderer } from "../../schema/primitive/component.ts";

export function checkLocks(
	locks: Lock[] | undefined,
	element: Record<string, unknown>,
): LockRenderer {
	if (!locks) return { isLocked: false };

	for (const lock of locks) {
		if (checkCondition(lock.condition, element)) {
			return { isLocked: true, text: lock.text };
		}
	}

	return { isLocked: false };
}
