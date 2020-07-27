import * as React from 'react';
import { Graphs, initData } from "./graphs"


const Example: React.FC = () => {  // 边tooltip坐标
  React.useEffect(() => {
    const graph = new Graphs(1200, 400);
    graph.initUseDirect(initData);
    graph.render();
    // graph.setData(initData);
  });

  return (
    <div id="container"></div>
  );
}

export default Example