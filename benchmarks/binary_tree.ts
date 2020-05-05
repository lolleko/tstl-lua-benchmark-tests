/* The Computer Language Benchmarks Game
   https://salsa.debian.org/benchmarksgame-team/benchmarksgame/

   contributed by Léo Sarrazin
   multi thread by Andrey Filatkin
   converted by Isaac Gouy
*/

export function binaryTreeBenchmark() {
    const maxDepth = 18;

    const stretchDepth = maxDepth + 1;
    const check = itemCheck(bottomUpTree(stretchDepth));

    const longLivedTree = bottomUpTree(maxDepth);

    const tasks: Data[] = [];
    for (let depth = 4; depth <= maxDepth; depth += 2) {
        const iterations = 1 << maxDepth - depth + 4;
        tasks.push({ iterations, depth });
    }

    const results = tasks.map(t => work(t.iterations, t.depth));
    // for (const result of results) {
    //     print(result);
    // }
}

function work(iterations: number, depth: number): string {
    let check = 0;
    for (let i = 0; i < iterations; i++) {
        check += itemCheck(bottomUpTree(depth));
    }
    return `${iterations}\t trees of depth ${depth}\t check: ${check}`;
}

function cTreeNode(left?: TreeNode, right?: TreeNode): TreeNode {
    return { left, right };
}

function itemCheck(node: TreeNode): number {
    if (node.left === undefined || node.right === undefined) {
        return 1;
    }
    return 1 + itemCheck(node.left) + itemCheck(node.right);
}

function bottomUpTree(depth: number): TreeNode {
    return depth > 0
        ? cTreeNode(bottomUpTree(depth - 1), bottomUpTree(depth - 1))
        : cTreeNode(undefined, undefined);
}

interface Data {
    iterations: number;
    depth: number;
}

interface TreeNode {
    left?: TreeNode,
    right?: TreeNode
}
