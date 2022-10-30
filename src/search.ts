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

  const visited = new Set<number>([ id ]);

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
        (mode == "ancestors" || mode == "web")
        && !visited.has(edge.source)
        && visited.has(edge.target)
      ) {
        // Add the edge's origin vertex
        visited.add(edge.source);
        // Keep scanning in case of more valid edges
        running = true;
      }
      // If the current edge leads from an already visited vertex
      if (
        (mode == "descendants" || mode == "web")
        && !visited.has(edge.target)
        && visited.has(edge.source)
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

export function ancestorsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return ancestors(id, edges).concat(id);
}

export function cousinsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return cousins(id, edges).concat(id);
}

export function siblingsAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return siblings(id, edges).concat(id);
}

export function childrenAndSelf(id: number, edges: DirectedEdge[]): number[] {
  return children(id, edges).concat(id);
}

export function everything(edges: DirectedEdge[]): number[] {
  return Array.from(
    new Set(edges.flatMap((edge) => [edge.source, edge.target]))
  );
}
