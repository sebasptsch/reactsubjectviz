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
  return uniqueNumbers(
    parentsOfId.concat(
      parentsOfId.flatMap((parent) => ancestors(parent, edges))
    )
  );
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
  return uniqueNumbers(
    childrenOfId.concat(
      childrenOfId.flatMap((child) => descendants(child, edges))
    )
  );
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
