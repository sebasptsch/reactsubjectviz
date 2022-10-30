import edges from "./edges.json";

/**
 * Structure for a node in the graph.
 */
interface Node {
  id: number;
  label: string | null;
  url: string | null;
  course: string | null;
}

/**
 * Strucutre of the edges in the graph.
 */
interface DirectedEdge {
  source: number;
  target: number;
}

export function parents(id: number, edges: DirectedEdge[]): number[] {
  return edges.filter((edge) => edge.target === id).map((edge) => edge.source);
}

export function ancestors(id: number, edges: DirectedEdge[]): number[] {
  const parentsOfId = parents(id, edges);
  return parentsOfId.concat(
    parentsOfId.flatMap((parent) => ancestors(parent, edges))
  );
}

export function children(id: number, edges: DirectedEdge[]): number[] {
  return edges.filter((edge) => edge.source === id).map((edge) => edge.target);
}

export function descendants(id: number, edges: DirectedEdge[]): number[] {
  const childrenOfId = children(id, edges);
  return childrenOfId.concat(
    childrenOfId.flatMap((child) => descendants(child, edges))
  );
}

export function descendantsAndSelf(
  id: number,
  edges: DirectedEdge[]
): number[] {
  return [id].concat(descendants(id, edges));
}

export function parentsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return [id].concat(parents(id, edges));
}

export function siblings(id: number, edges: DirectedEdge[]): number[] {
  const parentsOfId = parents(id, edges);
  return parentsOfId
    .flatMap((parent) => children(parent, edges))
    .filter((child) => child !== id);
}

export function cousins(id: number, edges: DirectedEdge[]): number[] {
  const siblingsOfId = siblings(id, edges);
  return siblingsOfId.flatMap((sibling) => descendants(sibling, edges));
}

export function related(id: number, edges: DirectedEdge[]): number[] {
  return ancestors(id, edges).concat(descendants(id, edges));
}

export function relatedAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return related(id, edges).concat(id);
}

// depth first search taking start and maximum depth outputting array of ids
export default function maze(start: number, edges: DirectedEdge[]): number[] {
  const stack = [start];
  const visited = new Set<number>();
  const result = [];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) {
      continue;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    result.push(current);
    stack.push(...children(current, edges));
  }
  return result;
}

// breadth first search taking start and maximum depth outputting array of ids
export function bfs(start: number, edges: DirectedEdge[]): number[] {
  const queue = [start];
  const visited = new Set<number>();
  const result = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      continue;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    result.push(current);
    queue.push(...children(current, edges));
  }
  return result;
}

// depth first search taking start and maximum depth outputting array of ids
export function dfs(
  start: number,
  edges: DirectedEdge[],
  maxDepth: number
): number[] {
  const stack = [{ id: start, depth: 0 }];
  const visited = new Set<number>();
  const result = [];
  while (stack.length > 0) {
    const { id, depth } = stack.pop()!;
    if (visited.has(id)) {
      continue;
    }
    visited.add(id);
    result.push(id);
    if (depth < maxDepth) {
      stack.push(
        ...children(id, edges).map((child) => ({ id: child, depth: depth + 1 }))
      );
    }
  }
  return result;
}

export function shortestPath(
  start: number,
  end: number,
  edges: DirectedEdge[]
): number[] {
  const queue = [{ id: start, path: [start] }];
  const visited = new Set<number>();
  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    if (visited.has(id)) {
      continue;
    }
    visited.add(id);
    if (id === end) {
      return path;
    }
    queue.push(
      ...children(id, edges).map((child) => ({
        id: child,
        path: path.concat(child),
      }))
    );
  }
  return [];
}
