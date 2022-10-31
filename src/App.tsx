import { useControls } from "leva";
import { useCallback, useMemo } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import graphData from "./data.json";
import {
  useSearchParamsStateBoolean,
  useSearchParamsStateNumber,
  useWindowSize,
} from "./hooks";
import {
  ancestors,
  descendants,
  dijkstraShortestPath,
  undirected,
} from "./search";
const parseId = (input: number | { id: number }) =>
  typeof input === "number" ? input : input.id;

interface Node {
  id: number;
  label: string | null;
  url: string | null;
  course: string | null;
}

interface Link {
  source: number;
  target: number;
}

// maze();

function App() {
  const { height, width } = useWindowSize();
  const [querySubjectId, setQuerySubjectId] = useSearchParamsStateNumber(
    "subjectId",
    48024
  );
  const [queryEndSubjectId, setQueryEndSubjectId] = useSearchParamsStateNumber(
    "endSubjectId",
    0
  );
  const [queryShowLabels, setQueryShowLabels] = useSearchParamsStateBoolean(
    "showLabels",
    true
  );
  const [queryUndirected, setQueryUndirected] = useSearchParamsStateBoolean(
    "undirected",
    false
  );
  const [queryShowAncestors, setQueryShowAncestors] =
    useSearchParamsStateBoolean("showAncestors", true);
  const [queryShowDescendants, setQueryShowDescendants] =
    useSearchParamsStateBoolean("showDescendants", true);
  const [queryShowSelf, setQueryShowSelf] = useSearchParamsStateBoolean(
    "showSelf",
    true
  );
  // const [circleMode, setCircleMode] = useSearchParamsStateBoolean(
  //   "circleMode",
  //   false
  // );

  const {
    subjectId,
    endSubjectId,
    showLabels,
    undirected: undirectedGraph,
    descendants: showDescendants,
    ancestors: showAncestors,
    self: showSelf,
  } = useControls(
    {
      subjectId: {
        step: 1,
        value: querySubjectId,
        onChange: setQuerySubjectId,
        label: "Subject ID",
        transient: false,
      },
      endSubjectId: {
        step: 1,
        value: queryEndSubjectId,
        onChange: setQueryEndSubjectId,
        label: "End Subject ID",
        transient: false,
      },
      showLabels: {
        value: queryShowLabels,
        onChange: setQueryShowLabels,
        label: "Show Labels",
        transient: false,
      },
      undirected: {
        value: queryUndirected,
        onChange: setQueryUndirected,
        label: "Undirected",
        transient: false,
      },
      descendants: {
        value: queryShowDescendants,
        onChange: setQueryShowDescendants,
        label: "Show Descendants",
        transient: false,
      },
      ancestors: {
        value: queryShowAncestors,
        onChange: setQueryShowAncestors,
        label: "Show Ancestors",
        transient: false,
      },
      self: {
        value: queryShowSelf,
        onChange: setQueryShowSelf,
        label: "Show Self",
        transient: false,
      },
    },
    [
      querySubjectId,
      queryEndSubjectId,
      queryShowLabels,
      queryUndirected,
      queryShowAncestors,
      queryShowDescendants,
      queryShowSelf,
    ]
  );

  // give edges connecting to the given populated nodes
  const edgesFromNodes = (nodes: number[]) => {
    const populatedNodes = nodes.map((node) =>
      graphData.nodes.find((n) => n.id === node)
    );
    const populatedLinks = graphData.links.filter((link) => {
      const source = populatedNodes.find(
        (node) => node?.id === parseId(link.source)
      );
      const target = populatedNodes.find(
        (node) => node?.id === parseId(link.target)
      );
      return source && target;
    });
    return populatedLinks;
  };

  const getData = useCallback(() => {
    if (subjectId === 0) {
      return graphData;
    }

    let nodes: number[] = [];

    let initialEdges: { source: number; target: number }[] = [];

    if (undirectedGraph) {
      initialEdges = undirected(graphData.links);
    } else {
      initialEdges = graphData.links;
    }

    if (endSubjectId === 0) {
      nodes.push(
        ...dijkstraShortestPath(subjectId, endSubjectId, initialEdges)
      );
    } else {
      if (showDescendants) {
        nodes.push(...descendants(subjectId, initialEdges));
      }

      if (showAncestors) {
        nodes.push(...ancestors(subjectId, initialEdges));
      }

      if (showSelf) {
        nodes.push(subjectId);
      }
    }

    // const nodes = relatedAndSelf(subjectId, graphData.links);
    const links = edgesFromNodes(nodes);
    const populatedNodes = graphData.nodes.filter((node) =>
      nodes.includes(node.id)
    );
    return { nodes: populatedNodes, links };
  }, [
    undirectedGraph,
    showDescendants,
    showAncestors,
    showSelf,
    subjectId,
    endSubjectId,
  ]);

  const data = useMemo(getData, [
    getData,
    undirectedGraph,
    showDescendants,
    showAncestors,
    showSelf,
    subjectId,
    endSubjectId,
  ]);

  return (
    <ForceGraph3D
      graphData={data}
      width={width}
      height={height}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.25}
      showNavInfo={false}
      // @ts-ignore
      nodeLabel={(node) => node.label ?? node.id}
      nodeAutoColorBy="course"
      enableNodeDrag={false}
      nodeThreeObject={
        !showLabels
          ? undefined
          : (node) => {
              if (node.id === subjectId) {
                node.fx = 0;
                node.fy = 0;
                node.fz = 0;
              }

              const sprite = new SpriteText(
                // @ts-ignore
                node.label
                  ? // @ts-ignore
                    `${node.id?.toString() ?? ""}: ${node.label}`
                  : node.id?.toString()
              );
              sprite.textHeight = 8;
              sprite.fontWeight = node.id === subjectId ? "bold" : "normal";
              // @ts-ignore
              sprite.color = node.color;
              sprite.backgroundColor = "rgba(0, 0, 0, 0.5)";
              return sprite;
            }
      }
      onNodeClick={(node, e) => {
        if (e.ctrlKey) {
          // @ts-ignore
          setSubjectId(node.id);
        } else {
          // @ts-ignore
          window.open(node.url, "_blank");
        }
      }}
    />
  );
}

export default App;
