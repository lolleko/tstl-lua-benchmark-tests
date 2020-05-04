"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var exec = require("@actions/exec");
var github = require("@actions/github");
var fs = require("fs");
var table = require("markdown-table");
var benchmark_types_1 = require("./benchmark_types");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var baseline, results, memoryBaseline_1, memoryResults, comparisonTable_1, markdownSummary, markdownText, _a, gitHubRepoOwner, gitHubRepoName, gitHubSha, gitHubToken, octokit, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, exec.exec("npx typescript-to-lua -p tsconfig.json", [], { cwd: "benchmarks" })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, exec.exec("lua -- main.lua benchmark_results.json", [], { cwd: "benchmarks/dist" })];
                case 2:
                    _b.sent();
                    baseline = JSON.parse(fs.readFileSync("benchmarks/benchmark_baseline.json").toString());
                    results = JSON.parse(fs.readFileSync("benchmarks/dist/benchmark_results.json").toString());
                    memoryBaseline_1 = baseline.filter(benchmark_types_1.isMemoryBenchmarkResult);
                    memoryResults = results.filter(benchmark_types_1.isMemoryBenchmarkResult);
                    comparisonTable_1 = [["Name", "Baseline (kb)", "Pull Request (kb)", "Change (%)"]];
                    // we iteerate by the new benchmark in case benchmarks have been added
                    memoryResults.forEach(function (result) {
                        var baseline = memoryBaseline_1.find(function (r) { return r.benchmarkName == result.benchmarkName; });
                        if (baseline) {
                            comparisonTable_1.push([
                                result.benchmarkName,
                                "" + baseline.memoryUsedForExec,
                                "" + result.memoryUsedForExec,
                                "" + (100 - baseline.memoryUsedForExec / result.memoryUsedForExec * 100)
                            ]);
                        }
                        else {
                            console.log("No Baseline found for " + result.benchmarkName + " maybe it's a new benchmark?");
                        }
                    });
                    markdownSummary = "### Benchmark results:\n**Memory:**\n\n" + table(comparisonTable_1);
                    markdownText = "**Baseline:**\n" + JSON.stringify(memoryBaseline_1) + "\n**PR:**\n" + JSON.stringify(memoryResults);
                    _a = process.env.GITHUB_REPOSITORY.split("/"), gitHubRepoOwner = _a[0], gitHubRepoName = _a[1];
                    gitHubSha = process.env.GITHUB_SHA;
                    gitHubToken = core.getInput("github-token");
                    octokit = new github.GitHub(gitHubToken);
                    octokit.checks.create({
                        owner: gitHubRepoOwner,
                        repo: gitHubRepoName,
                        name: "Check Created by API",
                        head_sha: gitHubSha,
                        status: "completed",
                        conclusion: "neutral",
                        output: {
                            title: "Benchmark Results",
                            summary: markdownSummary,
                            text: markdownText
                        }
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
run();
