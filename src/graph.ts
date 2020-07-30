import "./register-shape";
import { Graph } from "@antv/g6";
import { Item, GraphData } from '@antv/g6/lib/types';
import { INode, IEdge } from "@antv/g6/lib/interface/item";
import { PipelineGraphOptions, PipelineGraphData, PipelineNodeConfig, NodeRole, getGroupId, getIndexId, getPrimaryNodeId } from "./common";


export class PipelineGraph extends Graph {
  private width: number = 0;
  private height: number = 0;

  constructor(width: number, height: number, cfg: PipelineGraphOptions) {
    super(cfg);
    this.width = width;
    this.height = height;
  }

  bindClickOnNode(cb: (node: Item) => void): void {
    this.on("node:click", (evt: any) => {

      const { item } = evt;
      const shape = evt.target.cfg.name;
      const node = <INode>item;
      const sourceId = node.getID();
      const model = (<Item>item).getModel();
      const { x, y } = model;
      const point = this.getCanvasByPoint(x, y);

      if (shape === "right-plus") {
        let [group, index] = sourceId.split("-");
        group = String(Number(group) + 1);

        while (this.findById([group, index].join("-")) != undefined) {
          index = String(Number(index) + 1);
        }
        const targetId = [group, index].join("-");
        this.addNode(sourceId, targetId, Number(point.x), Number(point.y));
      }

      if (shape === "left-plus") {
        const source = (<INode>item);
        this.moveNode(node);
        this.removeEdge(node);
        this.removeItem(source.getID());
      }

      if (cb) { cb(item) };
    });
  }

  private addNode(sourceId: string, targetId: string, x: number, y: number) {
    const indexId = getIndexId(targetId);
    const pipelineNodeConfig: PipelineNodeConfig = {
      id: targetId,
      taskName: "none",
      role: indexId > 1 ? NodeRole.Second : NodeRole.Primary,
      x: Number(x) + 300,
      y: Number(y) + ((indexId - 1) * 60),
    }
    this.addItem("node", pipelineNodeConfig)


    if (indexId > 1) {
      this.getNodes().
        find((node: INode) => {
          return node.getID() == getPrimaryNodeId(targetId)
        }).
        getNeighbors().
        map((pnode: INode) => {
          this.addItem("edge", { source: targetId, target: pnode.getID() });
        });
    } else {
      this.getNodes()
        .map((node: INode) => {
          if (getGroupId(node.getID()) == (getGroupId(targetId) - 1)) {
            this.addItem("edge", { source: targetId, target: node.getID() });
          }
        })
    }
  }

  private removePrimaryNode(node: INode) {

  }

  private removeEdge(node: INode) {
    // console.log("neighbors node", node.getNeighbors())
    // 2 如果节点有左右邻居,应该左右邻居握手
    node.getEdges().map((edge: IEdge) => {
      console.log("remove edge", edge.getModel());
      this.removeItem(edge.getID())
    })
  }

  private moveNode(node: INode) {
    // 如果有子节点,那么需要将子节点上移
    let modelConfig = node.getModel();
    modelConfig.x -= 60;
    this.updateItem(node, modelConfig);

    this.getNodes().
      map((_node: INode) => {
        if (getGroupId(_node.getID()) == getGroupId(node.getID()) && getIndexId(_node.getID()) > getIndexId(node.getID())) {
          console.log("move node", _node.getID())
          let nodeConfig = _node.getModel();
          nodeConfig.y = nodeConfig.y - 60;
          this.updateItem(_node, nodeConfig);
        }
      }
      );
  }

  setTaskName(node: Item, taskName: string): void {
    const cfg: Partial<PipelineNodeConfig> = { taskName: taskName };
    this.updateItem(node, cfg);
  }

  setNodeRole(node: Item, role: NodeRole): void {
    const cfg: Partial<PipelineNodeConfig> = { role: role };
    this.updateItem(node, cfg);
  }

  bindMouseenter(): void {
    this.on("node:mouseenter", (evt: { item: Item }) => {
      this.setItemState(evt.item, "hover", true);
    });
  }

  bindMouseleave(): void {
    this.on("node:mouseleave", (evt: { item: Item }) => {
      this.setItemState(evt.item, "hover", false);
    });
  }

  enableShowtime(data: PipelineGraphData): void {
    data.nodes.map(node => node.showtime = true)
  }

  enableAddNode(data: PipelineGraphData): void {
    data.nodes.map(node => node.addnode = true)
  }

  enableSubNode(data: PipelineGraphData): void {
    data.nodes.map(node => node.subnode = true)
  }

  pipelineSave(): PipelineGraphData {
    const pipelineGraphData: PipelineGraphData = {};
    return Object.assign(pipelineGraphData, this.save())
  }

  draw(data: GraphData): void {
    this.bindClickOnNode(null);
    this.bindMouseenter();
    this.bindMouseleave();

    this.enableShowtime(data);
    this.enableAddNode(data);
    this.enableSubNode(data);

    this.data(data);
    this.setMode("addEdge");
  }
}