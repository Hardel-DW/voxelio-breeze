import { performance } from "node:perf_hooks";
import { analyserCollection } from "../src/core/engine/Analyser";
import { VoxelToLootDataDriven } from "../src/core/schema/loot/Compiler";
import { LootDataDrivenToVoxelFormat } from "../src/core/schema/loot/Parser";
import { VoxelToRecipeDataDriven } from "../src/core/schema/recipe/Compiler";
import { RecipeDataDrivenToVoxelFormat } from "../src/core/schema/recipe/Parser";
import { StructureDataDrivenToVoxelFormat } from "../src/core/schema/structure/Parser";
import { VoxelToStructureDataDriven } from "../src/core/schema/structure/Compiler";
import { DATA_DRIVEN_TEMPLATE_ENCHANTMENT } from "../test/template/concept/enchant/DataDriven";
import { VOXEL_TEMPLATE_ENCHANTMENT } from "../test/template/concept/enchant/VoxelDriven";
import { shapeless, shaped, smelting, transform } from "../test/template/concept/recipe/DataDriven";
import { shapelessVoxel } from "../test/template/concept/recipe/VoxelDriven";
import { DATA_DRIVEN_TEMPLATE_LOOT_TABLE } from "../test/template/concept/loot/DataDriven";
import { VOXEL_TEMPLATE_LOOT_TABLE } from "../test/template/concept/loot/VoxelDriven";
import { village, mineshaft, bastion, fortress } from "../test/template/concept/structure/DataDriven";
import { villageVoxel, mineshaftVoxel, bastionVoxel, fortressVoxel } from "../test/template/concept/structure/VoxelDriven";

interface BenchmarkResult {
    name: string;
    avgTime: number;
    minTime: number;
    maxTime: number;
    opsPerSecond: number;
    iterations: number;
}

interface ConceptConfig {
    name: string;
    displayName: string;
    icon: string;
    parser: (element: any) => any;
    compiler: (voxel: any, original?: any) => any;
    registry: string; // For display/reference only
    testCases: {
        name: string;
        datadriven: any;
        voxel: any;
        size: string;
    }[];
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

// Configuration for all concepts
const concepts: ConceptConfig[] = [
    {
        name: "enchantment",
        displayName: "ENCHANTMENT",
        icon: "✨",
        parser: (element) => analyserCollection.enchantment.parser({ element }),
        compiler: (voxel, original) => analyserCollection.enchantment.compiler(voxel, "enchantment", original),
        registry: "enchantment",
        testCases: [
            {
                name: "simple",
                datadriven: DATA_DRIVEN_TEMPLATE_ENCHANTMENT[0],
                voxel: VOXEL_TEMPLATE_ENCHANTMENT[0].data,
                size: "~2KB"
            },
            {
                name: "complex",
                datadriven: DATA_DRIVEN_TEMPLATE_ENCHANTMENT[4],
                voxel: VOXEL_TEMPLATE_ENCHANTMENT[4].data,
                size: "~3KB"
            }
        ]
    },
    {
        name: "loot_table",
        displayName: "LOOT TABLE",
        icon: "🎁",
        parser: (element) => LootDataDrivenToVoxelFormat({ element }),
        compiler: (voxel, original) => VoxelToLootDataDriven(voxel, "loot_table", original),
        registry: "loot_table",
        testCases: [
            {
                name: "simple",
                datadriven: DATA_DRIVEN_TEMPLATE_LOOT_TABLE[0],
                voxel: VOXEL_TEMPLATE_LOOT_TABLE[0].data,
                size: "~1KB"
            },
            {
                name: "complex",
                datadriven: DATA_DRIVEN_TEMPLATE_LOOT_TABLE[1],
                voxel: VOXEL_TEMPLATE_LOOT_TABLE[1].data,
                size: "~2KB"
            }
        ]
    },
    {
        name: "recipe",
        displayName: "RECIPE",
        icon: "🔧",
        parser: (element) => RecipeDataDrivenToVoxelFormat({ element }),
        compiler: (voxel, original) => VoxelToRecipeDataDriven(voxel, "recipe", original),
        registry: "recipe",
        testCases: [
            {
                name: "shapeless",
                datadriven: shapeless,
                voxel: shapelessVoxel.data,
                size: "~1.5KB"
            },
            {
                name: "shaped",
                datadriven: shaped,
                voxel: shaped.data, // Need to parse first for voxel
                size: "~2KB"
            },
            {
                name: "smelting",
                datadriven: smelting,
                voxel: smelting.data, // Need to parse first for voxel
                size: "~1KB"
            },
            {
                name: "smithing",
                datadriven: transform,
                voxel: transform.data, // Need to parse first for voxel
                size: "~2.5KB"
            }
        ]
    },
    {
        name: "structure",
        displayName: "STRUCTURE",
        icon: "🏗️",
        parser: (element) => StructureDataDrivenToVoxelFormat({ element }),
        compiler: (voxel, original) => VoxelToStructureDataDriven(voxel, "worldgen/structure", original),
        registry: "worldgen/structure",
        testCases: [
            {
                name: "village (jigsaw)",
                datadriven: village,
                voxel: villageVoxel.data,
                size: "~3KB"
            },
            {
                name: "mineshaft (legacy)",
                datadriven: mineshaft,
                voxel: mineshaftVoxel.data,
                size: "~1KB"
            },
            {
                name: "bastion (jigsaw)",
                datadriven: bastion,
                voxel: bastionVoxel.data,
                size: "~4KB"
            },
            {
                name: "fortress (legacy)",
                datadriven: fortress,
                voxel: fortressVoxel.data,
                size: "~2KB"
            }
        ]
    }
];

console.log("🚀 Voxel Breeze Performance Comparison\n");

// Run benchmarks for each concept
const allResults: Array<{ concept: string; results: BenchmarkResult[] }> = [];

for (const concept of concepts) {
    console.log(`${concept.icon} ${concept.displayName} SCHEMA PERFORMANCE`);
    console.log("=".repeat(120));
    console.log(
        `${"Operation".padEnd(40)} | ${"Ops/sec".padStart(8)} | ${"Avg Time".padStart(8)} | ${"Min Time".padStart(8)} | ${"Max Time".padStart(8)}`
    );
    console.log("-".repeat(120));

    const conceptResults: BenchmarkResult[] = [];

    // Parse benchmarks
    for (const testCase of concept.testCases) {
        conceptResults.push(
            benchmark(`Parse ${testCase.name}`, () => {
                concept.parser(testCase.datadriven);
            })
        );
    }

    // Compile benchmarks (use first test case for simplicity)
    const firstCase = concept.testCases[0];
    conceptResults.push(
        benchmark(`Compile ${firstCase.name}`, () => {
            concept.compiler(firstCase.voxel);
        })
    );

    // Round-trip benchmarks
    for (const testCase of concept.testCases.slice(0, 2)) {
        // Limit to first 2 for performance
        conceptResults.push(
            benchmark(`Round-trip ${testCase.name}`, () => {
                const voxel = concept.parser(testCase.datadriven);
                concept.compiler(voxel, testCase.datadriven.data);
            })
        );
    }

    // Display results
    for (const result of conceptResults) {
        console.log(formatResult(result));
    }

    allResults.push({ concept: concept.name, results: conceptResults });
    console.log("");
}

console.log("📈 PERFORMANCE COMPARISON");
console.log("=".repeat(120));

// Cross-concept performance analysis
const conceptPerformances = allResults.map(({ concept, results }) => ({
    name: concept,
    displayName: concepts.find((c) => c.name === concept)?.displayName || concept,
    icon: concepts.find((c) => c.name === concept)?.icon || "📊",
    avgParsing:
        results.filter((r) => r.name.includes("Parse")).reduce((sum, r) => sum + r.opsPerSecond, 0) /
        results.filter((r) => r.name.includes("Parse")).length,
    avgCompiling:
        results.filter((r) => r.name.includes("Compile")).reduce((sum, r) => sum + r.opsPerSecond, 0) /
        results.filter((r) => r.name.includes("Compile")).length,
    avgRoundTrip:
        results.filter((r) => r.name.includes("Round-trip")).reduce((sum, r) => sum + r.opsPerSecond, 0) /
        results.filter((r) => r.name.includes("Round-trip")).length
}));

console.log("🔍 PARSING PERFORMANCE RANKING:");
const parseRanking = conceptPerformances.sort((a, b) => b.avgParsing - a.avgParsing);
parseRanking.forEach((perf, index) => {
    console.log(`  ${index + 1}. ${perf.icon} ${perf.displayName}: ${perf.avgParsing.toFixed(0)} ops/s`);
});

console.log("\n⚡ COMPILATION PERFORMANCE RANKING:");
const compileRanking = conceptPerformances.sort((a, b) => b.avgCompiling - a.avgCompiling);
compileRanking.forEach((perf, index) => {
    console.log(`  ${index + 1}. ${perf.icon} ${perf.displayName}: ${perf.avgCompiling.toFixed(0)} ops/s`);
});

console.log("\n🔄 ROUND-TRIP PERFORMANCE RANKING:");
const roundTripRanking = conceptPerformances.sort((a, b) => b.avgRoundTrip - a.avgRoundTrip);
roundTripRanking.forEach((perf, index) => {
    console.log(`  ${index + 1}. ${perf.icon} ${perf.displayName}: ${perf.avgRoundTrip.toFixed(0)} ops/s`);
});

console.log("\n🎯 PERFORMANCE RECOMMENDATIONS");
console.log("=".repeat(120));

const allBenchmarkResults = allResults.flatMap(({ results }) => results);
const slowestOperation = allBenchmarkResults.reduce((slowest, current) =>
    current.opsPerSecond < slowest.opsPerSecond ? current : slowest
);
const fastestOperation = allBenchmarkResults.reduce((fastest, current) =>
    current.opsPerSecond > fastest.opsPerSecond ? current : fastest
);

console.log(`🐌 Slowest operation: ${slowestOperation.name} (${slowestOperation.opsPerSecond.toFixed(0)} ops/s)`);
console.log(`⚡ Fastest operation: ${fastestOperation.name} (${fastestOperation.opsPerSecond.toFixed(0)} ops/s)`);

const performanceGap = fastestOperation.opsPerSecond / slowestOperation.opsPerSecond;
console.log(`📊 Performance gap: ${performanceGap.toFixed(0)}x difference between fastest and slowest`);

// Schema-specific recommendations
console.log("\n💡 Schema-specific optimization recommendations:");

const overallRanking = conceptPerformances
    .map((perf) => ({
        ...perf,
        overallScore: (perf.avgParsing + perf.avgCompiling + perf.avgRoundTrip) / 3
    }))
    .sort((a, b) => b.overallScore - a.overallScore);

console.log(
    `🥇 Best overall performance: ${overallRanking[0].icon} ${overallRanking[0].displayName} (${overallRanking[0].overallScore.toFixed(0)} ops/s avg)`
);
console.log(
    `🥈 Second best: ${overallRanking[1].icon} ${overallRanking[1].displayName} (${overallRanking[1].overallScore.toFixed(0)} ops/s avg)`
);
console.log(
    `🥉 Third: ${overallRanking[2].icon} ${overallRanking[2].displayName} (${overallRanking[2].overallScore.toFixed(0)} ops/s avg)`
);
console.log(
    `🔻 Needs optimization: ${overallRanking[3].icon} ${overallRanking[3].displayName} (${overallRanking[3].overallScore.toFixed(0)} ops/s avg)`
);

// Performance alerts
if (slowestOperation.opsPerSecond < 1000) {
    console.log("⚠️  Consider lazy loading for operations slower than 1000 ops/s");
}

if (slowestOperation.opsPerSecond < 100) {
    console.log("🚨 Critical: Operations slower than 100 ops/s need immediate optimization");
}

if (performanceGap > 100) {
    console.log("📈 Large performance gap detected - consider caching for slower operations");
}

console.log("\n🧠 MEMORY EFFICIENCY ESTIMATES");
console.log("=".repeat(120));
console.log(`${"Operation".padEnd(40)} | ${"Data Size".padStart(12)} | ${"Time/1000".padStart(10)}`);
console.log("-".repeat(70));

for (const { concept, results } of allResults) {
    const conceptConfig = concepts.find((c) => c.name === concept);
    const parseResult = results.find((r) => r.name.includes("Parse"));
    const compileResult = results.find((r) => r.name.includes("Compile"));

    if (!conceptConfig || !parseResult || !compileResult) {
        continue;
    }

    const timeFor1000Parse = 1000 / parseResult.opsPerSecond;
    const timeFor1000Compile = 1000 / compileResult.opsPerSecond;

    console.log(
        `${`${conceptConfig.icon} ${conceptConfig.displayName} Parse`.padEnd(40)} | ${conceptConfig.testCases[0].size.padStart(12)} | ${timeFor1000Parse.toFixed(2).padStart(10)}s`
    );
    console.log(
        `${`${conceptConfig.icon} ${conceptConfig.displayName} Compile`.padEnd(40)} | ${conceptConfig.testCases[0].size.padStart(12)} | ${timeFor1000Compile.toFixed(2).padStart(10)}s`
    );
}

console.log("\n🏆 SCHEMA RANKING BY USE CASE");
console.log("=".repeat(120));

console.log("📝 For UI responsiveness (parsing speed):");
parseRanking.forEach((perf, index) => {
    const recommendation =
        index === 0
            ? "Best for real-time editing"
            : index === 1
              ? "Good for most use cases"
              : index === 2
                ? "Consider optimization for heavy usage"
                : "Needs performance improvements";
    console.log(`  ${index + 1}. ${perf.icon} ${perf.displayName} - ${recommendation}`);
});

console.log("\n💾 For data processing (compilation speed):");
compileRanking.forEach((perf, index) => {
    console.log(`  ${index + 1}. ${perf.icon} ${perf.displayName} - ${perf.avgCompiling.toFixed(0)} ops/s`);
});

console.log("\n✅ Performance analysis completed!");
console.log(`📝 Total operations benchmarked: ${allBenchmarkResults.length}`);
console.log(`⏱️  Total benchmark time: ~${(allBenchmarkResults.reduce((sum, r) => sum + r.iterations, 0) * 0.001).toFixed(1)}s`);
console.log(`🎯 Schemas analyzed: ${concepts.map((c) => c.displayName).join(", ")}`);
console.log(`📊 ${concepts.length} concepts, ${concepts.reduce((sum, c) => sum + c.testCases.length, 0)} test cases total`);

console.log("\n💡 HOW TO ADD A NEW CONCEPT:");
console.log("=".repeat(120));
console.log("1. Create your concept's DataDriven and VoxelDriven templates");
console.log("2. Add a new ConceptConfig to the concepts array above");
console.log("3. Specify parser, compiler, registry, and test cases");
console.log("4. Run this benchmark to see performance metrics");
console.log("5. That's it! The benchmark will automatically include your new concept");
