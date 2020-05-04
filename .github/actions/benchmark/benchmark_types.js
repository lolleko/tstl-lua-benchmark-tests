"use strict";
exports.__esModule = true;
var BenchmarkKind;
(function (BenchmarkKind) {
    BenchmarkKind["Memory"] = "memory";
})(BenchmarkKind = exports.BenchmarkKind || (exports.BenchmarkKind = {}));
function isMemoryBenchmarkResult(result) {
    return result.kind == BenchmarkKind.Memory;
}
exports.isMemoryBenchmarkResult = isMemoryBenchmarkResult;
