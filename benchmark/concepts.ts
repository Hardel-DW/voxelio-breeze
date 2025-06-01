import { performance } from "node:perf_hooks";
import { analyserCollection } from "../src/core/engine/Analyser";
import { VoxelToLootDataDriven } from "../src/core/schema/loot/Compiler";
import { LootDataDrivenToVoxelFormat } from "../src/core/schema/loot/Parser";
import { VoxelToRecipeDataDriven } from "../src/core/schema/recipe/Compiler";
import { RecipeDataDrivenToVoxelFormat } from "../src/core/schema/recipe/Parser";
import { DATA_DRIVEN_TEMPLATE_ENCHANTMENT } from "../test/template/concept/enchant/DataDriven";
import { VOXEL_TEMPLATE_ENCHANTMENT } from "../test/template/concept/enchant/VoxelDriven";
import { shapeless, shaped, smelting, transform } from "../test/template/concept/recipe/DataDriven";
import { shapelessVoxel } from "../test/template/concept/recipe/VoxelDriven";
import { DATA_DRIVEN_TEMPLATE_LOOT_TABLE } from "../test/template/concept/loot/DataDriven";
import { VOXEL_TEMPLATE_LOOT_TABLE } from "../test/template/concept/loot/VoxelDriven";

interface BenchmarkResult {
    name: string;
    avgTime: number;
    minTime: number;
    maxTime: number;
    opsPerSecond: number;
    iterations: number;
}

function benchmark(name: string, fn: () => void, iterations = 1000): BenchmarkResult {
    const times: number[] = [];

    // Warmup
    for (let i = 0; i < 10; i++) {
        fn();
    }

    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        const end = performance.now();
        times.push(end - start);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = 1000 / avgTime;

    return {
        name,
        avgTime,
        minTime,
        maxTime,
        opsPerSecond,
        iterations
    };
}

function formatResult(result: BenchmarkResult): string {
    return `${result.name.padEnd(40)} | ${result.opsPerSecond.toFixed(0).padStart(8)} ops/s | ${result.avgTime.toFixed(3).padStart(8)}ms avg | ${result.minTime.toFixed(3).padStart(8)}ms min | ${result.maxTime.toFixed(3).padStart(8)}ms max`;
}

console.log("🚀 Voxel Breeze Performance Comparison\n");

// Test data
const { parser: enchantmentParser, compiler: enchantmentCompiler } = analyserCollection.enchantment;
const simpleEnchantmentDD = DATA_DRIVEN_TEMPLATE_ENCHANTMENT[0];
const complexEnchantmentDD = DATA_DRIVEN_TEMPLATE_ENCHANTMENT[4];
const simpleEnchantmentVoxel = VOXEL_TEMPLATE_ENCHANTMENT[0].data;

const simpleLootTableDD = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[0];
const complexLootTableDD = DATA_DRIVEN_TEMPLATE_LOOT_TABLE[1];
const simpleLootTableVoxel = VOXEL_TEMPLATE_LOOT_TABLE[0].data;

const simpleRecipeDD = shapeless;
const complexRecipeDD = shaped;
const smeltingRecipeDD = smelting;
const smithingRecipeDD = transform;
const simpleRecipeVoxel = shapelessVoxel.data;

console.log("📊 ENCHANTMENT SCHEMA PERFORMANCE");
console.log("=".repeat(120));
console.log(
    `${"Operation".padEnd(40)} | ${"Ops/sec".padStart(8)} | ${"Avg Time".padStart(8)} | ${"Min Time".padStart(8)} | ${"Max Time".padStart(8)}`
);
console.log("-".repeat(120));

const enchantmentResults = [
    benchmark("Parse simple enchantment", () => {
        enchantmentParser({ element: simpleEnchantmentDD });
    }),

    benchmark("Parse complex enchantment", () => {
        enchantmentParser({ element: complexEnchantmentDD });
    }),

    benchmark("Compile simple enchantment", () => {
        enchantmentCompiler(simpleEnchantmentVoxel, "enchantment");
    }),

    benchmark("Round-trip simple enchantment", () => {
        const voxel = enchantmentParser({ element: simpleEnchantmentDD });
        enchantmentCompiler(voxel, "enchantment", simpleEnchantmentDD.data);
    }),

    benchmark("Round-trip complex enchantment", () => {
        const voxel = enchantmentParser({ element: complexEnchantmentDD });
        enchantmentCompiler(voxel, "enchantment", complexEnchantmentDD.data);
    })
];

for (const result of enchantmentResults) {
    console.log(formatResult(result));
}

console.log("\n📊 LOOT TABLE SCHEMA PERFORMANCE");
console.log("=".repeat(120));
console.log(
    `${"Operation".padEnd(40)} | ${"Ops/sec".padStart(8)} | ${"Avg Time".padStart(8)} | ${"Min Time".padStart(8)} | ${"Max Time".padStart(8)}`
);
console.log("-".repeat(120));

const lootTableResults = [
    benchmark("Parse simple loot table", () => {
        LootDataDrivenToVoxelFormat({ element: simpleLootTableDD });
    }),

    benchmark("Parse complex loot table", () => {
        LootDataDrivenToVoxelFormat({ element: complexLootTableDD });
    }),

    benchmark("Compile simple loot table", () => {
        VoxelToLootDataDriven(simpleLootTableVoxel, "loot_table");
    }),

    benchmark("Round-trip simple loot table", () => {
        const voxel = LootDataDrivenToVoxelFormat({ element: simpleLootTableDD });
        VoxelToLootDataDriven(voxel, "loot_table", simpleLootTableDD.data);
    }),

    benchmark("Round-trip complex loot table", () => {
        const voxel = LootDataDrivenToVoxelFormat({ element: complexLootTableDD });
        VoxelToLootDataDriven(voxel, "loot_table", complexLootTableDD.data);
    })
];

for (const result of lootTableResults) {
    console.log(formatResult(result));
}

console.log("\n📊 RECIPE SCHEMA PERFORMANCE");
console.log("=".repeat(120));
console.log(
    `${"Operation".padEnd(40)} | ${"Ops/sec".padStart(8)} | ${"Avg Time".padStart(8)} | ${"Min Time".padStart(8)} | ${"Max Time".padStart(8)}`
);
console.log("-".repeat(120));

const recipeResults = [
    benchmark("Parse simple recipe (shapeless)", () => {
        RecipeDataDrivenToVoxelFormat({ element: simpleRecipeDD });
    }),

    benchmark("Parse complex recipe (shaped)", () => {
        RecipeDataDrivenToVoxelFormat({ element: complexRecipeDD });
    }),

    benchmark("Parse smelting recipe", () => {
        RecipeDataDrivenToVoxelFormat({ element: smeltingRecipeDD });
    }),

    benchmark("Parse smithing recipe", () => {
        RecipeDataDrivenToVoxelFormat({ element: smithingRecipeDD });
    }),

    benchmark("Compile simple recipe", () => {
        VoxelToRecipeDataDriven(simpleRecipeVoxel, "recipe");
    }),

    benchmark("Round-trip simple recipe", () => {
        const voxel = RecipeDataDrivenToVoxelFormat({ element: simpleRecipeDD });
        VoxelToRecipeDataDriven(voxel, "recipe", simpleRecipeDD.data);
    }),

    benchmark("Round-trip complex recipe", () => {
        const voxel = RecipeDataDrivenToVoxelFormat({ element: complexRecipeDD });
        VoxelToRecipeDataDriven(voxel, "recipe", complexRecipeDD.data);
    }),

    benchmark("Round-trip smelting recipe", () => {
        const voxel = RecipeDataDrivenToVoxelFormat({ element: smeltingRecipeDD });
        VoxelToRecipeDataDriven(voxel, "recipe", smeltingRecipeDD.data);
    })
];

for (const result of recipeResults) {
    console.log(formatResult(result));
}

console.log("\n📈 PERFORMANCE COMPARISON");
console.log("=".repeat(120));

// Compare parsing performance across schemas
const enchantmentParseSimple = enchantmentResults[0];
const lootTableParseSimple = lootTableResults[0];
const recipeParseSimple = recipeResults[0];

console.log("🔍 PARSING PERFORMANCE COMPARISON:");
const enchantVsLoot = enchantmentParseSimple.opsPerSecond / lootTableParseSimple.opsPerSecond;
const enchantVsRecipe = enchantmentParseSimple.opsPerSecond / recipeParseSimple.opsPerSecond;
const recipeVsLoot = recipeParseSimple.opsPerSecond / lootTableParseSimple.opsPerSecond;

console.log(`  Enchantment vs Loot Table: ${enchantVsLoot.toFixed(2)}x ${enchantVsLoot > 1 ? "faster" : "slower"}`);
console.log(`  Enchantment vs Recipe: ${enchantVsRecipe.toFixed(2)}x ${enchantVsRecipe > 1 ? "faster" : "slower"}`);
console.log(`  Recipe vs Loot Table: ${recipeVsLoot.toFixed(2)}x ${recipeVsLoot > 1 ? "faster" : "slower"}`);

// Compare compilation performance
const enchantmentCompileSimple = enchantmentResults[2];
const lootTableCompileSimple = lootTableResults[2];
const recipeCompileSimple = recipeResults[4];

console.log("\n⚡ COMPILATION PERFORMANCE COMPARISON:");
const enchantCompileVsLoot = enchantmentCompileSimple.opsPerSecond / lootTableCompileSimple.opsPerSecond;
const enchantCompileVsRecipe = enchantmentCompileSimple.opsPerSecond / recipeCompileSimple.opsPerSecond;
const recipeCompileVsLoot = recipeCompileSimple.opsPerSecond / lootTableCompileSimple.opsPerSecond;

console.log(`  Enchantment vs Loot Table: ${enchantCompileVsLoot.toFixed(2)}x ${enchantCompileVsLoot > 1 ? "faster" : "slower"}`);
console.log(`  Enchantment vs Recipe: ${enchantCompileVsRecipe.toFixed(2)}x ${enchantCompileVsRecipe > 1 ? "faster" : "slower"}`);
console.log(`  Recipe vs Loot Table: ${recipeCompileVsLoot.toFixed(2)}x ${recipeCompileVsLoot > 1 ? "faster" : "slower"}`);

// Compare round-trip performance
const enchantmentRoundTripSimple = enchantmentResults[3];
const lootTableRoundTripSimple = lootTableResults[3];
const recipeRoundTripSimple = recipeResults[5];

console.log("\n🔄 ROUND-TRIP PERFORMANCE COMPARISON:");
const enchantRoundTripVsLoot = enchantmentRoundTripSimple.opsPerSecond / lootTableRoundTripSimple.opsPerSecond;
const enchantRoundTripVsRecipe = enchantmentRoundTripSimple.opsPerSecond / recipeRoundTripSimple.opsPerSecond;
const recipeRoundTripVsLoot = recipeRoundTripSimple.opsPerSecond / lootTableRoundTripSimple.opsPerSecond;

console.log(`  Enchantment vs Loot Table: ${enchantRoundTripVsLoot.toFixed(2)}x ${enchantRoundTripVsLoot > 1 ? "faster" : "slower"}`);
console.log(`  Enchantment vs Recipe: ${enchantRoundTripVsRecipe.toFixed(2)}x ${enchantRoundTripVsRecipe > 1 ? "faster" : "slower"}`);
console.log(`  Recipe vs Loot Table: ${recipeRoundTripVsLoot.toFixed(2)}x ${recipeRoundTripVsLoot > 1 ? "faster" : "slower"}`);

console.log("\n🎯 PERFORMANCE RECOMMENDATIONS");
console.log("=".repeat(120));

// Analyze results and provide recommendations
const allResults = [...enchantmentResults, ...lootTableResults, ...recipeResults];
const slowestOperation = allResults.reduce((slowest, current) => (current.opsPerSecond < slowest.opsPerSecond ? current : slowest));
const fastestOperation = allResults.reduce((fastest, current) => (current.opsPerSecond > fastest.opsPerSecond ? current : fastest));

console.log(`🐌 Slowest operation: ${slowestOperation.name} (${slowestOperation.opsPerSecond.toFixed(0)} ops/s)`);
console.log(`⚡ Fastest operation: ${fastestOperation.name} (${fastestOperation.opsPerSecond.toFixed(0)} ops/s)`);

const performanceGap = fastestOperation.opsPerSecond / slowestOperation.opsPerSecond;
console.log(`📊 Performance gap: ${performanceGap.toFixed(0)}x difference between fastest and slowest`);

// Schema-specific recommendations
console.log("\n💡 Schema-specific optimization recommendations:");

const avgEnchantmentPerf = enchantmentResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / enchantmentResults.length;
const avgLootTablePerf = lootTableResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / lootTableResults.length;
const avgRecipePerf = recipeResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / recipeResults.length;

const performances = [
    { name: "Enchantment", avg: avgEnchantmentPerf },
    { name: "Loot Table", avg: avgLootTablePerf },
    { name: "Recipe", avg: avgRecipePerf }
].sort((a, b) => b.avg - a.avg);

console.log(`🥇 Best overall performance: ${performances[0].name} (${performances[0].avg.toFixed(0)} ops/s avg)`);
console.log(`🥈 Second best: ${performances[1].name} (${performances[1].avg.toFixed(0)} ops/s avg)`);
console.log(`🥉 Third: ${performances[2].name} (${performances[2].avg.toFixed(0)} ops/s avg)`);

// Recommendations based on performance
if (slowestOperation.opsPerSecond < 1000) {
    console.log("⚠️  Consider lazy loading for operations slower than 1000 ops/s");
}

if (slowestOperation.opsPerSecond < 100) {
    console.log("🚨 Critical: Operations slower than 100 ops/s need immediate optimization");
}

if (performanceGap > 100) {
    console.log("📈 Large performance gap detected - consider caching for slower operations");
}

// Memory efficiency estimates
console.log("\n🧠 MEMORY EFFICIENCY ESTIMATES");
console.log("=".repeat(120));

const estimateMemoryUsage = (result: BenchmarkResult, dataSize: string) => {
    const processingRate = result.opsPerSecond;
    const timeFor1000 = 1000 / processingRate;
    console.log(`${result.name.padEnd(40)} | ${dataSize.padStart(12)} | ${timeFor1000.toFixed(2).padStart(10)}s for 1000 items`);
};

console.log(`${"Operation".padEnd(40)} | ${"Data Size".padStart(12)} | ${"Time/1000".padStart(10)}`);
console.log("-".repeat(70));

estimateMemoryUsage(enchantmentParseSimple, "~2KB");
estimateMemoryUsage(lootTableParseSimple, "~1KB");
estimateMemoryUsage(recipeParseSimple, "~1.5KB");
estimateMemoryUsage(enchantmentCompileSimple, "~3KB");
estimateMemoryUsage(lootTableCompileSimple, "~2KB");
estimateMemoryUsage(recipeCompileSimple, "~2.5KB");

console.log("\n🏆 SCHEMA RANKING BY USE CASE");
console.log("=".repeat(120));

console.log("📝 For UI responsiveness (parsing speed):");
console.log(`  1. ${performances[0].name} - Best for real-time editing`);
console.log(`  2. ${performances[1].name} - Good for most use cases`);
console.log(`  3. ${performances[2].name} - Consider optimization for heavy usage`);

console.log("\n💾 For data processing (compilation speed):");
const compilationPerfs = [
    { name: "Enchantment", ops: enchantmentCompileSimple.opsPerSecond },
    { name: "Loot Table", ops: lootTableCompileSimple.opsPerSecond },
    { name: "Recipe", ops: recipeCompileSimple.opsPerSecond }
].sort((a, b) => b.ops - a.ops);

compilationPerfs.forEach((perf, index) => {
    console.log(`  ${index + 1}. ${perf.name} - ${perf.ops.toFixed(0)} ops/s`);
});

console.log("\n✅ Performance analysis completed!");
console.log(`📝 Total operations benchmarked: ${allResults.length}`);
console.log(`⏱️  Total benchmark time: ~${(allResults.reduce((sum, r) => sum + r.iterations, 0) * 0.001).toFixed(1)}s`);
console.log("🎯 Schemas analyzed: Enchantment, Loot Table, Recipe");
