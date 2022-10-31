import makeAsynchronous from "make-asynchronous";
import { dijkstraShortestPath } from "./search";

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

export const asyncDijkstraShortestPath = makeAsynchronous(
  (source: number, target: number, edges: DirectedEdge[]) => {
    return dijkstraShortestPath(source, target, edges);
  }
);
