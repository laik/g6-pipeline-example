import "./register-shape";
import G6 from "@antv/g6";
import { Graph } from "@antv/g6";
import { GraphOptions, Item, GraphData, NodeConfig, EdgeData, TreeGraphData } from '@antv/g6/lib/types';
import { INode } from "@antv/g6/lib/interface/item";


export const graphId = "container"

const initGraphNode: NodeConfig = {
  id: "0-0",
  x: 0,
  y: 0,
  taskName: "",
  anchorPoints: [
    [0, 0.5],
    [1, 0.5],
  ],
}
export const initData: GraphData = {
  nodes: [initGraphNode],
}

export interface IConfigProps {
  width: number;
  height: number;
  cfg?: GraphOptions;
}

export interface IStateProps {
  A?: keyof JSX.IntrinsicElements | any;
}

const cfg: GraphOptions = {
  container: graphId,
  width: 1200,
  height: 300,
  renderer: "svg",
  autoPaint: true,
  defaultEdge: {
    type: "Line",
    style: {
      stroke: "#959DA5",
      lineWidth: 4,
    },
    // 其他配置
  },
  defaultNode: {
    type: "pipeline-node",
    size: [140, 60],
    linkPoints: {
      left: true,
      right: true,
      size: 5,
    },
  },
  nodeStateStyles: {
    hover: {
      fillOpacity: 0.1,
      lineWidth: 2,
    },
  },
};


export enum NodeState {
  Succeed,
  Failed,
  Pending,
  Cancel,
  Pause,
}

export class Graphs {
  private graph: Graph = null;
  private width: number = 0;
  private height: number = 0;
  private cfg: GraphOptions = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cfg = cfg;
  }

  setNodeStatus(item: Item, state: string): void {
    this.graph.setItemState(item, state, true);
  }

  bindClickOnNode(callback: (currentNode: INode) => any): void {
    this.graph.on("node:click", (evt: any) => {
      const { item } = evt;
      const shape = evt.target.cfg.name;

      if (shape === "right-plus") {
        const source = item._cfg.id.toString();
        let splitSource = source.split("-");
        splitSource[0] = Number(splitSource[0]) + 1;

        let tragetId = splitSource.join("-");

        const model = item.getModel();
        const { x, y } = model;
        const point = this.graph.getCanvasByPoint(x, y);
        const NodeX = Number(point.x) + 300;

        if (this.width - NodeX < 400) {
          this.width = this.width + 400;
          this.changeSize(this.width, this.height);
        }

        this.graph.addItem("node", {
          id: tragetId,
          taskName: "",
          x: Number(point.x) + 300,
          y: Number(point.y),
          anchorPoints: [
            [0, 0.5],
            [1, 0.5],
          ],
        });

        this.graph.addItem("edge", {
          source: tragetId,
          target: model.id,
        });

        return;
      }

      if (shape === "bottom-plus") {
        const source = item._cfg.id;
        let splitSource = source.split("-");

        splitSource[1] = Number(splitSource[1]) + 1;

        let tragetId = splitSource.join("-");
        const model = item.getModel();
        const { x, y } = model;
        const point = this.graph.getCanvasByPoint(x, y);
        const NodeY: number = Number(point.y) + 80;

        if (this.height - NodeY < 100) {
          this.height = this.height + 100;
          this.changeSize(this.width, this.height);
        }

        this.graph.addItem("node", {
          id: tragetId,
          taskName: "",
          x: Number(point.x),
          y: NodeY,
          anchorPoints: [
            [0, 0.5],
            [1, 0.5],
          ],
        });

        let edgeTarget = model.id.toString();
        let splitEdgeTarget = edgeTarget.split('-');
        splitEdgeTarget[0] = Number(splitEdgeTarget[0]);
        splitEdgeTarget[1] = '1';
        let edgeTargetId = splitEdgeTarget.join("-");

        this.graph.addItem("edge", {
          type: "hvh",
          source: edgeTargetId,
          target: tragetId,
        });
        return;
      }

      callback(item);

    });
  }

  // setTaskName(taskName: string, node: any): void {
  //   let nodes = this.instance.save();
  //   nodes.nodes.map((item: any, index: number) => {
  //     if (node._cfg.id === item.id) {
  //       item.taskName = taskName
  //     }
  //     nodes[index] = item;
  //   })
  //   this.instance.changeData(nodes);
  //   this.instance.setItemState(node, "click", taskName);
  // }

  bindMouseenter(): void {
    // 监听鼠标进入节点事件
    this.graph.on("node:mouseenter", (evt: { item: any }) => {
      const node = evt.item;
      // 激活该节点的 hover 状态
      this.graph.setItemState(node, "hover", true);
    });
  }

  bindMouseleave(): void {
    // 监听鼠标离开节点事件
    this.graph.on("node:mouseleave", (evt: { item: any }) => {
      const node = evt.item;
      // 关闭该节点的 hover 状态
      this.graph.setItemState(node, "hover", false);
    });
  }

  changeSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.graph.changeSize(this.width, this.height);
  }

  changeData(data: GraphData | TreeGraphData): void {
    this.graph.changeData(data);
  }

  initUseDirect(data: GraphData | TreeGraphData): void {
    this.graph = new G6.Graph(this.cfg);
    this.graph.data(data);
    this.graph.setMode("addEdge");
  }

  render() {
    return this.graph.render()
  }
}