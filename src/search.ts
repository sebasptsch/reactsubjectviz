/** A strategy to traverse a directed graph.
 * * `"web"`: a connected graph of all reachable vertices from `id`.
 * * `"ancestors"`: all vertices that lead to `id`.
 * * `"descendants"`: all vertices that follow from `id`.
 * * `"tree"`: union of `"ancestors"`, `"descendants"` and `id`.
 */
export type Traversal = "web" | "ancestors" | "descendants" | "tree";

/** Traverse the graph `edges` starting from `id`, with
 * `mode` determining the returned vertex cover.
 */
export function traverse(
  id: number,
  edges: DirectedEdge[],
  mode: Traversal
): Set<number> {
  if (mode == "tree") {
    return new Set<number>([
      id,
      ...traverse(id, edges, "ancestors"),
      ...traverse(id, edges, "descendants"),
    ]);
  }

  const visited = new Set<number>([id]);

  let running = true;
  while (running) {
    // Just try looping through all edges once
    // If a valid edge is found, then it's possible a previous once has
    // become valid and running will become true
    // to allow another iteration
    running = false;
    // Go through each directed each in the graph
    for (const edge of edges) {
      // If the current edge points to an already visited vertex
      if (
        (mode == "ancestors" || mode == "web") &&
        !visited.has(edge.source) &&
        visited.has(edge.target)
      ) {
        // Add the edge's origin vertex
        visited.add(edge.source);
        // Keep scanning in case of more valid edges
        running = true;
      }
      // If the current edge leads from an already visited vertex
      if (
        (mode == "descendants" || mode == "web") &&
        !visited.has(edge.target) &&
        visited.has(edge.source)
      ) {
        // Add the edge's target vertex
        visited.add(edge.target);
        // Keep scanning in case of more valid edges
        running = true;
      }
    }
  }

  visited.delete(id);

  return visited;
}

/**
 * Structure of a node in the graph.
 */
interface Node {
  id: number;
  label: string | null;
  url: string | null;
  course: string | null;
}

/**
 * Structure of an edge in the graph.
 */
interface DirectedEdge {
  source: number;
  target: number;
}

/**
 * Find the unique numbers
 * @param values The values to find the unique numbers of
 * @returns The unique numbers
 */
const uniqueNumbers = (values: number[]) => {
  const set = new Set(values);
  return Array.from(set);
};

/**
 * Returns the parents of a node in the graph.
 * @param id The id of the node to find the parents of.
 * @param edges The edges in the graph.
 * @returns The parents of the node with the given id.
 */
export function parents(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(
    edges.filter((edge) => edge.target === id).map((edge) => edge.source)
  );
}

/**
 * Returns the ancestors of a node in the graph.
 * @param id The id of the node to find the children of.
 * @param edges The edges in the graph.
 * @returns The ids of the children of the node.
 */
export function ancestors(id: number, edges: DirectedEdge[]): number[] {
  const parentsOfId = parents(id, edges);
  const queue = [...parentsOfId];
  const ancestorsArray = new Set<number>();
  while (queue.length > 0) {
    const nextId = queue.pop()!;
    ancestorsArray.add(nextId);
    const parentsOfNextId = parents(nextId, edges);
    parentsOfNextId.forEach((parentId) => {
      if (!ancestorsArray.has(parentId)) {
        queue.push(parentId);
      }
    });
  }
  return Array.from(ancestorsArray);
}

/**
 * Returns the children of a node in the graph.
 * @param id The id of the node to find the children of.
 * @param edges The edges in the graph.
 * @returns The ids of the children of the node.
 */
export function children(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(
    edges.filter((edge) => edge.source === id).map((edge) => edge.target)
  );
}

/**
 * Returns the descendants of a node in the graph.
 * @param id The id of the node to find the descendants of.
 * @param edges The edges in the graph.
 * @returns The ids of the descendants of the node.
 */
export function descendants(id: number, edges: DirectedEdge[]): number[] {
  const childrenOfId = children(id, edges);
  const queue = [...childrenOfId];
  const descendantsArray = new Set<number>();
  while (queue.length > 0) {
    const nextId = queue.pop()!;
    descendantsArray.add(nextId);
    const childrenOfNextId = children(nextId, edges);
    childrenOfNextId.forEach((childId) => {
      if (!descendantsArray.has(childId)) {
        queue.push(childId);
      }
    });
  }
  return Array.from(descendantsArray);
}

/**
 * Returns the descendants of a node in the graph along with the node itself.
 * @param id The id of the node to find the descendants of.
 * @param edges The edges in the graph.
 * @returns The ids of the descendants of the node and the id of the node.
 */
export function descendantsAndSelf(
  id: number,
  edges: DirectedEdge[]
): number[] {
  return uniqueNumbers([id].concat(descendants(id, edges)));
}

/**
 * Returns the parents of a node in the graph along with the node itself.
 * @param id The id of the node to find the parents of.
 * @param edges The edges in the graph.
 * @returns The ids of the parents of the node and the id of the node.
 */
export function parentsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers([id].concat(parents(id, edges)));
}

/**
 * Returns the siblings of a node in the graph.
 * @param id The id of the node to find the siblings of.
 * @param edges The edges in the graph.
 * @returns The ids of the siblings of the node.
 */
export function siblings(id: number, edges: DirectedEdge[]): number[] {
  const parentsOfId = parents(id, edges);
  return uniqueNumbers(
    parentsOfId
      .flatMap((parent) => children(parent, edges))
      .filter((child) => child !== id)
  );
}

/**
 * Returns the cousins of a node in the graph along with the node itself.
 * @param id The id of the node to find the cousins of.
 * @param edges The edges in the graph.
 * @returns The ids of the cousins of the node.
 */
export function cousins(id: number, edges: DirectedEdge[]): number[] {
  const siblingsOfId = siblings(id, edges);
  return uniqueNumbers(
    siblingsOfId.flatMap((sibling) => descendants(sibling, edges))
  );
}

/**
 * Returns the relations of a node in the graph.
 * @param id The id of the node to find all the relations of.
 * @param edges The edges in the graph.
 * @returns The ids of all the relations of the node.
 */
export function related(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(ancestors(id, edges).concat(descendants(id, edges)));
}

/**
 * Returns the relations of a node in the graph along with the node itself.
 * @param id The id of the node to find the relations of.
 * @param edges The edges in the graph.
 * @returns The ids of the relations of the node and the id of the node.
 */
export function relatedAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(related(id, edges).concat(id));
}

/**
 * Returns the ancestors of a node in the graph along with the node itself.
 * @param id The id of the node to find the ancestors of.
 * @param edges The edges in the graph.
 * @returns The ids of the ancestors of the node and the id of the node.
 */
export function ancestorsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(ancestors(id, edges).concat(id));
}

/**
 * Returns the cousins of a node in the graph along with the node itself.
 * @param id The id of the node to find the cousins of.
 * @param edges The edges in the graph.
 * @returns The ids of the cousins of the node and the id of the node.
 */
export function cousinsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(cousins(id, edges).concat(id));
}

/**
 * Returns the children of a node in the graph along with the node itself.
 * @param id The id of the node to find the siblings of.
 * @param edges The edges in the graph.
 * @returns The ids of the siblings of the node and the id of the node.
 */
export function siblingsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(siblings(id, edges).concat(id));
}

/**
 * Returns the children of a node in the graph along with the node itself.
 * @param id The id of the node to find the children of.
 * @param edges The edges in the graph.
 * @returns The ids of the children of the node and the id of the node.
 */
export function childrenAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return uniqueNumbers(children(id, edges).concat(id));
}

/**
 * Returns all the elements in the graph.
 * @param edges The edges in the graph.
 * @returns The ids of all the graph elements
 */
export function everything(edges: DirectedEdge[]): number[] {
  return uniqueNumbers(edges.flatMap((edge) => [edge.source, edge.target]));
}

/**
 * Returns the nodes that are not connected to any other nodes.
 * @param edges The edges in the graph.
 * @returns The ids of the nodes that are not connected to any other nodes.
 */
export function isolatedNodes(edges: DirectedEdge[]): number[] {
  return uniqueNumbers(
    everything(edges).filter((id) => related(id, edges).length === 0)
  );
}

/**
 * Basic implementation of a priority queue.
 */
export class PriorityQueue<T> {
  private readonly _queue: T[] = [];
  private readonly _comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this._comparator = comparator;
  }

  public enqueue(element: T): void {
    this._queue.push(element);
    this._queue.sort(this._comparator);
    console.log("Queue", this._queue);
  }

  public dequeue(): T | undefined {
    return this._queue.shift();
  }

  public get length(): number {
    return this._queue.length;
  }
}

/**
 * Returns the shortest path between two nodes in the graph.
 * @param source The id of the source node.
 * @param target The id of the target node.
 * @param edges The edges in the graph.
 * @returns The shortest path between the source and target nodes.
 */
export function dijkstraShortestPath(
  source: number,
  target: number,
  edges: DirectedEdge[]
): number[] {
  const queue = new PriorityQueue<[number, number[]]>((a, b) => a[0] - b[0]);
  const visited = new Set<number>();
  queue.enqueue([0, [source]]);
  while (queue.length > 0) {
    const [distance, path] = queue.dequeue()!;
    const current = path[path.length - 1];
    if (current === target) {
      return path;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    children(current, edges).forEach((child) => {
      queue.enqueue([distance + 1, path.concat(child)]);
    });
  }
  return [];
}

export function postman(edges: DirectedEdge[]): number[][] {
  const oddNodes = everything(edges).filter(
    (id) => related(id, edges).length % 2 === 1
  );
  const oddPairs = oddNodes.flatMap((id) => {
    return oddNodes
      .filter((otherId) => otherId !== id)
      .map((otherId) => [id, otherId]);
  });
  const paths = oddPairs.map(([source, target]) => {
    return dijkstraShortestPath(source, target, edges);
  });
  return paths;
}

export function postmanTour(edges: DirectedEdge[]): number[] {
  const paths = postman(edges);
  const tour = paths.flat();
  return uniqueNumbers(tour);
}

export function hasCycle(edges: DirectedEdge[]): boolean {
  const nodes = everything(edges);
  const visited = new Set<number>();
  const stack = new Set<number>();
  for (const node of nodes) {
    if (visited.has(node)) {
      continue;
    }
    stack.add(node);
    while (stack.size > 0) {
      const current = stack.values().next().value;
      stack.delete(current);
      visited.add(current);
      const children = related(current, edges);
      for (const child of children) {
        if (stack.has(child)) {
          return true;
        }
        if (!visited.has(child)) {
          stack.add(child);
        }
      }
    }
  }
  return false;
}

// return all relations as if undirected
export function undirected(edges: DirectedEdge[]): DirectedEdge[] {
  return edges.flatMap((edge) => [
    edge,
    { source: edge.target, target: edge.source },
  ]);
}
