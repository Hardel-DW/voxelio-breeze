import { performance } from "node:perf_hooks";
import { analyserCollection } from "../src/core/engine/Analyser";
import { VoxelToLootDataDriven } from "../src/core/schema/loot/Compiler";
import { LootDataDrivenToVoxelFormat } from "../src/core/schema/loot/Parser";
import { DATA_DRIVEN_TEMPLATE_ENCHANTMENT, DATA_DRIVEN_TEMPLATE_LOOT_TABLE } from "../test/template/datadriven";
import { VOXEL_TEMPLATE_ENCHANTMENT, VOXEL_TEMPLATE_LOOT_TABLE } from "../test/template/voxel";

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

console.log("\n📈 PERFORMANCE COMPARISON");
console.log("=".repeat(120));

// Compare parsing performance
const enchantmentParseSimple = enchantmentResults[0];
const lootTableParseSimple = lootTableResults[0];
const parseRatio = enchantmentParseSimple.opsPerSecond / lootTableParseSimple.opsPerSecond;

console.log(`Enchantment parsing is ${parseRatio.toFixed(2)}x ${parseRatio > 1 ? "faster" : "slower"} than loot table parsing`);

// Compare compilation performance
const enchantmentCompileSimple = enchantmentResults[2];
const lootTableCompileSimple = lootTableResults[2];
const compileRatio = enchantmentCompileSimple.opsPerSecond / lootTableCompileSimple.opsPerSecond;

console.log(`Enchantment compilation is ${compileRatio.toFixed(2)}x ${compileRatio > 1 ? "faster" : "slower"} than loot table compilation`);

// Compare round-trip performance
const enchantmentRoundTripSimple = enchantmentResults[3];
const lootTableRoundTripSimple = lootTableResults[3];
const roundTripRatio = enchantmentRoundTripSimple.opsPerSecond / lootTableRoundTripSimple.opsPerSecond;

console.log(
    `Enchantment round-trip is ${roundTripRatio.toFixed(2)}x ${roundTripRatio > 1 ? "faster" : "slower"} than loot table round-trip`
);

console.log("\n🎯 PERFORMANCE RECOMMENDATIONS");
console.log("=".repeat(120));

// Analyze results and provide recommendations
const allResults = [...enchantmentResults, ...lootTableResults];
const slowestOperation = allResults.reduce((slowest, current) => (current.opsPerSecond < slowest.opsPerSecond ? current : slowest));
const fastestOperation = allResults.reduce((fastest, current) => (current.opsPerSecond > fastest.opsPerSecond ? current : fastest));

console.log(`🐌 Slowest operation: ${slowestOperation.name} (${slowestOperation.opsPerSecond.toFixed(0)} ops/s)`);
console.log(`⚡ Fastest operation: ${fastestOperation.name} (${fastestOperation.opsPerSecond.toFixed(0)} ops/s)`);

const performanceGap = fastestOperation.opsPerSecond / slowestOperation.opsPerSecond;
console.log(`📊 Performance gap: ${performanceGap.toFixed(0)}x difference between fastest and slowest`);

// Recommendations based on performance
console.log("\n💡 Optimization recommendations:");

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
estimateMemoryUsage(enchantmentCompileSimple, "~3KB");
estimateMemoryUsage(lootTableCompileSimple, "~2KB");

console.log("\n✅ Performance analysis completed!");
console.log(`📝 Total operations benchmarked: ${allResults.length}`);
console.log(`⏱️  Total benchmark time: ~${(allResults.reduce((sum, r) => sum + r.iterations, 0) * 0.001).toFixed(1)}s`);
