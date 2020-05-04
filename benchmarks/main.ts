import { memoryBench } from "./lib/garbage_collection_bench";
import { binaryTreeBenchmark } from "./binary_tree";
import { nBodyBenchmark } from "./n_body";
import { encode } from "./lib/json";

declare var arg: any[];

const memoryBenchmarkFunctions = [binaryTreeBenchmark, nBodyBenchmark];

function benchmarks() {
    print(arg[0]);
    const result = memoryBenchmarkFunctions.map(memoryBench);
    print(encode(result));
    // TODO fix lua-types
    const outputFile = io.open(arg[0], "w")[0] as LuaFile
    outputFile.write(encode(result))
}

benchmarks();
