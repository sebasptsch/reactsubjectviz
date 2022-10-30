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
