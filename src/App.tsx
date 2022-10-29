import { useEffect, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import links from "./edges.json";
import nodes from "./nodes.json";

function App() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (window) setWidth(window.innerWidth);
  }, []);
  return (
    <ForceGraph3D
      graphData={{ links, nodes }}
      width={width}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.25}
      // linkVisibility={false}
      // nodeVisibility={(node) => node.id === 48024}
      nodeAutoColorBy="course"
      // nodeVisibility={(node) => node.id === 48024}
      enableNodeDrag={false}
      forceEngine="d3"
      nodeThreeObject={(node) => {
        const sprite = new SpriteText(
          // @ts-ignore
          node.label
            ? // @ts-ignore
              `${node.id?.toString() ?? ""}: ${node.label}`
            : node.id?.toString()
        );
        sprite.textHeight = 8;
        sprite.color = node.color;
        sprite.backgroundColor = "rgba(0, 0, 0, 0.5)";
        return sprite;
      }}
      onNodeClick={(node) => {
        // @ts-ignore
        window.open(node.url!, "_blank");
      }}
    />
  );
}

export default App;
