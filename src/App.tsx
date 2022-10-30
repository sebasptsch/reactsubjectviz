import dat from "dat.gui";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import edges from "./edges.json";
import {
  useSearchParamsStateBoolean,
  useSearchParamsStateNumber,
  useWindowSize,
} from "./hooks";
import nodesFromFile from "./nodes.json";
import { relatedAndSelf } from "./search";
const graphData = {
  nodes: nodesFromFile,
  links: edges,
};

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
  const datRef = useRef<dat.GUI | null>(null);
  const { height, width } = useWindowSize();
  const [subjectId, setSubjectId] = useSearchParamsStateNumber(
    "subjectId",
    48024
  );
  const [circleMode, setCircleMode] = useSearchParamsStateBoolean(
    "circleMode",
    false
  );

  useEffect(() => {
    datRef.current = new dat.GUI();
    const gui = datRef.current;
    var params = {
      subjectId,
      circleMode,
    };

    gui
      .add(params, "subjectId", 0, 100000, 1)
      .name("Subject ID")
      .onFinishChange(setSubjectId);

    gui
      .add(params, "circleMode")
      .name("Circle Mode")
      .onFinishChange(setCircleMode);

    return () => {
      gui.destroy();
      datRef.current = null;
    };
  }, []);

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
    const nodes = relatedAndSelf(subjectId, edges);
    const links = edgesFromNodes(nodes);
    const populatedNodes = graphData.nodes.filter((node) =>
      nodes.includes(node.id)
    );
    return { nodes: populatedNodes, links };
  }, [subjectId, edges]);

  const graphFiltered = useMemo(() => {
    return getData();
  }, [subjectId, getData]);

  return (
    <ForceGraph3D
      // ref={forceGraphRef}
      graphData={graphFiltered}
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
        circleMode
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
