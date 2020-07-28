import * as React from 'react';
import { PipelineGraph } from "./graph"
import { defaultInitData, defaultCfg, } from "./common"


const Example: React.FC = () => {  // 边tooltip坐标
  React.useEffect(() => {
    const graph = new PipelineGraph(1200, 400, defaultCfg);
    graph.draw(defaultInitData);
    graph.render();
  
    graph.setItemState(graph.getNodes()[0], "time", "12:00:00");
  });

  return (
    <div id="container"></div>
  );
}

export default Example