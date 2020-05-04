import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as github from "@actions/github";
import * as fs from "fs";
import * as table from "markdown-table";

import { BenchmarkResult, isMemoryBenchmarkResult } from "./benchmark_types";

async function run() {
  try {
    await exec.exec("npx typescript-to-lua -p tsconfig.json", [], { cwd: "benchmarks" })
    await exec.exec("lua -- main.lua benchmark_results.json", [], { cwd: "benchmarks/dist" })

    const baseline = JSON.parse(fs.readFileSync("benchmarks/benchmark_baseline.json").toString()) as BenchmarkResult[];

    const results = JSON.parse(fs.readFileSync("benchmarks/dist/benchmark_results.json").toString()) as BenchmarkResult[];

    const memoryBaseline = baseline.filter(isMemoryBenchmarkResult);
    const memoryResults = results.filter(isMemoryBenchmarkResult);

    const comparisonTable = [["Name", "Baseline (kb)", "Pull Request (kb)", "Change (%)"]];

    // we iteerate by the new benchmark in case benchmarks have been added
    memoryResults.forEach(result => {
      const baseline = memoryBaseline.find(r => r.benchmarkName == result.benchmarkName);
      if (baseline) {
        comparisonTable.push([
          result.benchmarkName,
          `${baseline.memoryUsedForExec}`,
          `${result.memoryUsedForExec}`,
          `${100 - baseline.memoryUsedForExec / result.memoryUsedForExec * 100}`
        ]);
      } else {
        console.log(`No Baseline found for ${result.benchmarkName} maybe it's a new benchmark?`);
      }
    });

    const markdownSummary =
      `### Benchmark results:
**Memory:**\n
${table(comparisonTable)}`;

    const markdownText =
      `**Baseline:**
${JSON.stringify(memoryBaseline)}
**PR:**
${JSON.stringify(memoryResults)}`;

    const [
      gitHubRepoOwner,
      gitHubRepoName
    ] = (process.env.GITHUB_REPOSITORY as string).split("/");
    const gitHubSha = process.env.GITHUB_SHA as string;
    const gitHubToken = core.getInput("github-token");

    const octokit = new github.GitHub(gitHubToken);

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
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();