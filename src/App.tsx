import dat from "dat.gui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import edges from "./edges.json";
import { useWindowSize } from "./hooks";
import nodesFromFile from "./nodes.json";
import { dfs, maze } from "./search";
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
  const [renderDepth, setRenderDepth] = useState(2);
  const [renderMazeStart, setRenderMazeStart] = useState(48024);
  const [renderMazeEnd, setRenderMazeEnd] = useState(48024);
  const [bidirectionalRender, setBidirectional] = useState(false);
  const [dfsEnabled, setDfsEnabled] = useState(false);
  const [mazeEnabled, setMazeEnabled] = useState(false);
  const { height, width } = useWindowSize();

  useEffect(() => {
    datRef.current = new dat.GUI();
    const gui = datRef.current;
    var params = {
      dfsEnabled: false,
      subjectId: 48024,
      depth: 2,
      mazeEnabled: false,
      mazeStart: 48024,
      mazeEnd: 48024,
      bidirectional: false,
    };

    const dfsFolder = gui.addFolder("DFS");

    const mazeFolder = gui.addFolder("Maze");

    gui.add(params, "bidirectional").onFinishChange(setBidirectional);

    dfsFolder.add(params, "dfsEnabled").onFinishChange(setDfsEnabled);

    dfsFolder
      .add(params, "subjectId", 0, 100000, 1)
      .name("Subject ID")
      .onFinishChange(setRenderSubjectId);

    dfsFolder
      .add(params, "depth", 0, 100, 1)
      .name("Depth")
      .onFinishChange(setRenderDepth);

    mazeFolder.add(params, "mazeEnabled").onFinishChange(setMazeEnabled);

    mazeFolder
      .add(params, "mazeStart", 0, 100000, 1)
      .name("Maze Start")
      .onFinishChange(setRenderMazeStart);
    mazeFolder
      .add(params, "mazeEnd", 0, 100000, 1)
      .name("Maze End")
      .onFinishChange(setRenderMazeEnd);

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

  const getDepth = useCallback(() => {
    const nodes = dfs(renderSubjectId, renderDepth, bidirectionalRender);
    const links = edgesFromNodes(nodes);
    const populatedNodes = graphData.nodes.filter((node) =>
      nodes.includes(node.id)
    );
    console.log("depth run");
    return { nodes: populatedNodes, links };
  }, [renderSubjectId, renderDepth, bidirectionalRender]);

  const getMaze = useCallback(() => {
    const nodes = maze(renderMazeStart, renderMazeEnd, bidirectionalRender);
    const links = edgesFromNodes(nodes);

    const populatedNodes = graphData.nodes.filter((node) =>
      nodes.includes(node.id)
    );
    console.log("maze run");
    return { nodes: populatedNodes, links };
  }, [renderMazeStart, renderMazeEnd, bidirectionalRender]);

  const graphFiltered = useMemo(() => {
    if (dfsEnabled) {
      return getDepth();
    }
    if (mazeEnabled) {
      return getMaze();
    }

    return { nodes: [], links: [] };
  }, [
    dfsEnabled,
    mazeEnabled,
    renderSubjectId,
    renderDepth,
    renderMazeStart,
    renderMazeEnd,
    bidirectionalRender,
  ]);
  // 41086, 23004
  useEffect(() => {
    console.log({ dfsEnabled });
  }, [dfsEnabled]);

  useEffect(() => {
    console.log({ mazeEnabled });
  }, [mazeEnabled]);

  useEffect(() => {
    console.log({ bidirectionalRender });
  }, [bidirectionalRender]);

  useEffect(() => {
    console.log({ graphFiltered });
  }, [graphFiltered]);

  return (
    <>
      {/* <select
        onChange={(e) => {
          e.preventDefault();
          setCourse(e.target.value);
        }}
        value={course}
        placeholder="Select a course"
      >
        <option value="">All</option>
        {[...new Set(nodesFromFile.map((node) => node.course))]
          .filter(Boolean)
          .map((course) => (
            <option value={course!} key={course}>
              {course}
            </option>
          ))}
      </select>
      <input
        value={subjectId}
        onChange={(e) => {
          const parsed = parseInt(e.target.value);
          if (!isNaN(parsed)) setSubjectId(parsed);
        }}
        placeholder="Subject id"
      /> */}
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
    </>
  );
}

export default App;
