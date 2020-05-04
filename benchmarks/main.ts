import { memoryBench } from "./memory_bench";
import { binaryTreeBenchmark } from "./binary_tree";
import { nBodyBenchmark } from "./n_body";
import { isMemoryBenchmarkResult, BenchmarkResult } from "./benchmark_types";

const json: { decode: (this: void, str: string) => {}, encode: (this: void, val: any) => string } = require("json");

declare var arg: any[];

const memoryBenchmarkFunctions = [binaryTreeBenchmark, nBodyBenchmark];

function benchmarks() {
    const newResults = memoryBenchmarkFunctions.map(memoryBench);

    const baselineFile = io.open(arg[0], "rb")[0] as LuaFile;
    const baselineContent = baselineFile.read("a");
    baselineFile.close();

    if (baselineContent[0]) {
        const baselineResult = json.decode(baselineContent[0]) as BenchmarkResult[];

        const memoryBaseline = baselineResult.filter(isMemoryBenchmarkResult);
        const memoryResults = newResults.filter(isMemoryBenchmarkResult);

        let comparisonTable = "| Name | Baseline (kb) | Commit (kb) | Change (%) |\n|-|-|-|-|\n";

        // we iteerate by the new benchmark in case benchmarks have been added
        memoryResults.forEach(result => {
            const baseline = memoryBaseline.find(r => r.benchmarkName == result.benchmarkName);
            if (baseline) {
                const percentageChange = 100 - baseline.memoryUsedForExec / result.memoryUsedForExec * 100;
                comparisonTable += `| ${result.benchmarkName} | ${baseline.memoryUsedForExec} | ${result.memoryUsedForExec} | ${percentageChange} |\n`;
            } else {
                print(`No Baseline found for ${result.benchmarkName} maybe it's a new benchmark?`);
            }
        });

        const markdownSummary =
            `**Memory:**
${comparisonTable}`;

        const markdownText =
            `**Baseline:**
${json.encode(memoryBaseline)}
**PR:**
${json.encode(memoryResults)}`;

        const jsonInfo = json.encode({ summary: markdownSummary, text: markdownText });
        print(jsonInfo);

        // const summaryFile = io.open("benchmark_summary.json", "w")[0] as LuaFile
        // summaryFile.write(json.encode({ summary: markdownSummary, text: markdownText }));

        //const newBaselineFile = io.open(arg[0], "w")[0] as LuaFile
        //newBaselineFile.write(encode(result));
    }
}

benchmarks();
