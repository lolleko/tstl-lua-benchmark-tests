import { memoryBench } from "./memory_bench";
import { binaryTreeBenchmark } from "./binary_tree";
import { nBodyBenchmark } from "./n_body";
import { isMemoryBenchmarkResult, BenchmarkResult } from "./benchmark_types";

const json: { decode: (this: void, str: string) => {}, encode: (this: void, val: any) => string } = require("json");

declare var arg: any[];

const memoryBenchmarkFunctions = [binaryTreeBenchmark, nBodyBenchmark];

function benchmarks() {
    const masterFile = io.open(arg[0], "rb")[0] as LuaFile;
    let masterContent: (string | undefined)[];
    if (_VERSION == "Lua 5.3") {
        // @ts-ignore
        masterContent = masterFile.read("a");
    } else {
        // @ts-ignore
        masterContent = masterFile.read("*a");
    }
    masterFile.close();

    if (masterContent[0]) {
        const masterResult = json.decode(masterContent[0]) as BenchmarkResult[];

        const newResults = memoryBenchmarkFunctions.map(memoryBench);

        const memoryMasterResult = masterResult.filter(isMemoryBenchmarkResult);
        const memoryNewResult = newResults.filter(isMemoryBenchmarkResult);

        let comparisonTable = "| name | master (kb) | commit (kb) | change (%) |\n|-|-|-|-|\n";

        // we iterate by the new benchmark in case benchmarks have been added
        memoryNewResult.forEach(newResult => {
            const master = memoryMasterResult.find(r => r.benchmarkName == newResult.benchmarkName);
            if (master) {
                const percentageChange = 100 - master.memoryUsedForExec / newResult.memoryUsedForExec * 100;
                comparisonTable += `| ${newResult.benchmarkName} | ${master.memoryUsedForExec} | ${newResult.memoryUsedForExec} | ${percentageChange} |\n`;
            } else {
                // No master found => new benchmark
                comparisonTable += `| ${newResult.benchmarkName}(new) | / | / | / |\n`;
            }
        });

        const markdownSummary =
            `**Memory:**
${comparisonTable}`;

        const markdownText =
            `**master:**
${json.encode(memoryMasterResult)}
**commit:**
${json.encode(memoryNewResult)}`;

        const jsonInfo = json.encode({ summary: markdownSummary, text: markdownText });
        print(jsonInfo);

        const newMasterFile = io.open(arg[0], "w+")[0] as LuaFile
        newMasterFile.write(json.encode(newResults));
    }
}

benchmarks();
