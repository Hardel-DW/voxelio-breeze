import { getAnalyserForVersion, versionedAnalyserCollection } from "@/core/engine/Analyser";
import { describe, expect, it } from "vitest";

describe("Engine System", () => {
    describe("Analyser", () => {
        describe("getAnalyserForVersion", () => {
            it("should get correct analyser for minimum supported version", () => {
                const analyser = getAnalyserForVersion("enchantment", 48);
                expect(analyser).toBeDefined();
                expect(analyser.config.analyser).toBe("enchantment");
            });

            it("should get correct analyser for current version", () => {
                const analyser = getAnalyserForVersion("enchantment", 100);
                expect(analyser).toBeDefined();
                expect(analyser.config.analyser).toBe("enchantment");
            });

            it("should throw error for version below minimum", () => {
                expect(() => getAnalyserForVersion("enchantment", 12)).toThrow("tools.error.no_analyser");
            });

            it("should throw error for invalid type", () => {
                // @ts-expect-error Testing invalid type
                expect(() => getAnalyserForVersion("invalid_type", 48)).toThrow("tools.error.no_analyser");
            });
        });

        describe("versionedAnalyserCollection", () => {
            it("should have valid version ranges", () => {
                for (const [_, analysers] of Object.entries(versionedAnalyserCollection)) {
                    for (const entry of analysers) {
                        expect(entry.range.min).toBeLessThanOrEqual(entry.range.max);
                        expect(entry.range.min).toBeGreaterThan(0);
                    }
                }
            });

            it("should have required properties for each analyser", () => {
                for (const [_, analysers] of Object.entries(versionedAnalyserCollection)) {
                    for (const entry of analysers) {
                        expect(entry.analyser).toHaveProperty("compiler");
                        expect(entry.analyser).toHaveProperty("parser");
                        expect(entry.analyser).toHaveProperty("properties");
                        expect(entry.config).toBeDefined();
                    }
                }
            });
        });
    });
});
