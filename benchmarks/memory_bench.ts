import { BenchmarkKind, MemoryBenchmarkResult } from "./benchmark_types";


export function memoryBench(f: Function): MemoryBenchmarkResult {
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