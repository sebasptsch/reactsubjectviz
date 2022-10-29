import { useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import { ForceGraphMethods } from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import edges from "./edges.json";
import nodes from "./nodes.json";
function App() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (window) setWidth(window.innerWidth);
  }, []);

  const forceGraphRef = useRef<undefined | ForceGraphMethods>();

  useEffect(() => {
    if (!forceGraphRef.current) return;
    // add gui elements
    // const gui = forceGraphRef.current.
  }, [forceGraphRef]);

  return (
    <ForceGraph3D
      ref={forceGraphRef}
      graphData={{ nodes, links: edges }}
      width={width}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.25}
      nodeRelSize={8}
      // @ts-ignore
      nodeLabel={(node) => node.label ?? node.id}
      // linkVisibility={(link) =>
      //   selectedNode
      //     ? link.source == selectedNode || link.target == selectedNode
      //     : true
      // }
      // nodeVisibility={(node) => node.id === 48024}
      nodeAutoColorBy="course"
      // nodeVisibility={(node) =>
      //   selectedNode ? node.id === selectedNode : true
      // }

      enableNodeDrag={false}
      forceEngine="d3"
      linkDirectionalParticles={1}
      nodeThreeObject={(node) => {
        // return undefined;
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
    />
  );
}

export default App;
