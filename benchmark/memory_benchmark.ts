import { BenchmarkKind, MemoryBenchmarkResult, json } from "./benchmark_types";


export function memoryBenchmark(f: Function): MemoryBenchmarkResult {
    let result: MemoryBenchmarkResult = { kind: BenchmarkKind.Memory, benchmarkName: "NO_NAME", preExecMemoryUsage: 0, postExecMemoryUsage: 0, memoryUsedForExec: 0, memoryAfterGC: 0 };

    collectgarbage('stop')
    result.preExecMemoryUsage = collectgarbage("count");

    f();

    result.postExecMemoryUsage = collectgarbage("count");
    result.memoryUsedForExec = result.postExecMemoryUsage - result.preExecMemoryUsage;

    collectgarbage("restart")
    collectgarbage("collect")

    result.memoryAfterGC = collectgarbage("count");

    result.benchmarkName = debug.getinfo(f).short_src;

    return result;
}

export function compareMemoryBenchmarks(oldResults: MemoryBenchmarkResult[], updatedResults: MemoryBenchmarkResult[]): [string, string] {
    let comparisonTable = "| name | master (kb) | commit (kb) | change (%) |\n| - | - | - | - |\n";

    // we group by the new results in case benchmarks have been added
    updatedResults.forEach(newResult => {
        const master = oldResults.find(r => r.benchmarkName == newResult.benchmarkName);
        if (master) {
            const percentageChange = newResult.memoryUsedForExec / master.memoryUsedForExec * 100 - 100;
            comparisonTable += `| ${newResult.benchmarkName} | ${master.memoryUsedForExec} | ${newResult.memoryUsedForExec} | ${percentageChange} |\n`;
        } else {
            // No master found => new benchmark
            comparisonTable += `| ${newResult.benchmarkName}(new) | / | / | / |\n`;
        }
    });

    const markdownSummary = `**Memory:**\n${comparisonTable}`;

    const markdownText =
        `**master:**\n${json.encode(oldResults)}\n**commit:**\n${json.encode(updatedResults)}`;

    return [markdownSummary, markdownText]
}