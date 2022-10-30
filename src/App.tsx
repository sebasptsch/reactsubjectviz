import dat from "dat.gui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import edges from "./edges.json";
import { useWindowSize } from "./hooks";
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
  const [renderSubjectId, setRenderSubjectId] = useState(48024);
  const { height, width } = useWindowSize();

  useEffect(() => {
    datRef.current = new dat.GUI();
    const gui = datRef.current;
    var params = {
      subjectId: 48024,
    };

    gui
      .add(params, "subjectId", 0, 100000, 1)
      .name("Subject ID")
      .onFinishChange(setRenderSubjectId);

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

  const getRelated = useCallback(() => {
    const nodes = relatedAndSelf(renderSubjectId, edges);
    const links = edgesFromNodes(nodes);
    const populatedNodes = graphData.nodes.filter((node) =>
      nodes.includes(node.id)
    );
    return { nodes: populatedNodes, links };
  }, [renderSubjectId, edges]);

  const graphFiltered = useMemo(() => {
    return getRelated();
  }, [renderSubjectId, getRelated]);

  return (
    <ForceGraph3D
      // ref={forceGraphRef}
      graphData={graphFiltered}
      width={width}
      height={height}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.25}
      nodeRelSize={8}
      // @ts-ignore
      nodeLabel={(node) => node.label ?? node.id}
      nodeAutoColorBy="course"
      enableNodeDrag={false}
      linkDirectionalParticles={1}
      nodeThreeObject={(node) => {
        const sprite = new SpriteText(
          // @ts-ignore
          node.label
            ? // @ts-ignore
              `${node.id?.toString() ?? ""}: ${node.label}`
            : node.id?.toString()
        );
        sprite.textHeight = 8;
        // @ts-ignore
        sprite.color = node.color;
        sprite.backgroundColor = "rgba(0, 0, 0, 0.5)";
        return sprite;
      }}
      onNodeClick={(node) => {
        // @ts-ignore
        window.open(node.url);
      }}
    />
  );
}

export default App;
