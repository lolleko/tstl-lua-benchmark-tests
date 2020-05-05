export enum BenchmarkKind {
    Memory = "memory",
}

export interface BenchmarkResult {
    kind: BenchmarkKind
}

export interface MemoryBenchmarkResult extends BenchmarkResult {
    kind: BenchmarkKind.Memory
    benchmarkName: string;
    preExecMemoryUsage: number,
    postExecMemoryUsage: number,
    memoryUsedForExec: number,
    memoryAfterGC: number,
}

export function isMemoryBenchmarkResult(result: BenchmarkResult): result is MemoryBenchmarkResult {
    return result.kind == BenchmarkKind.Memory;
}

export const json: { decode: (this: void, str: string) => {}, encode: (this: void, val: any) => string } = require("json");
