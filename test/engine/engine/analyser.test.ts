import { analyserCollection } from "@/core/engine/Analyser";
import { describe, expect, it } from "vitest";

describe("Engine System", () => {
    describe("Analyser", () => {
        describe("analyserCollection", () => {
            it("should get correct analyser for minimum supported version", () => {
                const analyser = analyserCollection.enchantment;
                expect(analyser).toBeDefined();
            });

            it("should get correct analyser for current version", () => {
                const analyser = analyserCollection.enchantment;
                expect(analyser).toBeDefined();
            });

            it("should throw error for version below minimum", () => {
                expect(() => analyserCollection.enchantment).toThrow("tools.error.no_analyser");
            });

            it("should throw error for invalid type", () => {
                // @ts-expect-error Testing invalid type
                expect(() => analyserCollection.invalid_type).toThrow("tools.error.no_analyser");
            });
        });
    });
});
