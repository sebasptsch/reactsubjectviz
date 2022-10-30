import edges from "./edges.json";

// depth first search taking start and depth outputting array of ids
export function dfs(
  start: number,
  maxDepth: number,
  bidirectional = false
): number[] {
  const visited = new Set();
  const result: number[] = [];

  function dfsTravel(id: number, depth: number) {
    if (visited.has(id)) {
      return;
    }
    visited.add(id);
    result.push(id);
    if (depth === 0) {
      return;
    }
    for (const edge of edges) {
      if (!edge) {
        console.log("no edge");
      }

      if (edge.source === id) {
        dfsTravel(edge.target, depth - 1);
      } else if (edge.target === id) {
        dfsTravel(edge.source, depth - 1);
      }
    }
  }

  dfsTravel(start, maxDepth);
  return result;
}

// breadth first search taking start and maximum depth outputting array of ids
export function bfs(start: number): number[] {
  const visited = new Set();
  const result: number[] = [];
  const queue: number[] = [start];

  while (queue.length > 0) {
    const id = queue.shift();
    if (visited.has(id)) {
      continue;
    }
    visited.add(id);
    result.push(id!);
    for (const edge of edges) {
      if (edge.source === id) {
        queue.push(edge.target);
      } else if (edge.target === id) {
        queue.push(edge.source);
      }
    }
  }
  return result;
}

// maze search taking start and end outputting array of ids
export function maze(
  start: number,
  end: number,
  bidirectional = false
): number[] {
  const visited = new Set();
  const result: number[] = [];
  const queue: number[] = [start];

  while (queue.length > 0) {
    const id = queue.shift();
    if (visited.has(id)) {
      continue;
    }
    visited.add(id);
    result.push(id!);
    if (id === end) {
      break;
    }
    for (const edge of edges) {
      if (edge.source === id) {
        queue.push(edge.target);
      } else if (edge.target === id) {
        queue.push(edge.source);
      }
    }
  }
  return result;
}
