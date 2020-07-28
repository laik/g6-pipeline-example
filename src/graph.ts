import "./register-shape";
import G6 from "@antv/g6";
import { Graph } from "@antv/g6";
import { GraphOptions, Item, GraphData, TreeGraphData } from '@antv/g6/lib/types';
import { INode } from "@antv/g6/lib/interface/item";
import { PipelineGraphOptions, PipelineGraphData, PipelineNodeConfig, NodeRole } from "./common";


export class PipelineGraph extends Graph {
  private width: number = 0;
  private height: number = 0;

  constructor(width: number, height: number, cfg: PipelineGraphOptions) {
    super(cfg);
    this.width = width;
    this.height = height;
  }

  bindClickOnNode(cb: (node: Item) => void, notify: (message: string) => void): void {
    this.on("node:click", (evt: any) => {

      const { item } = evt;
      const shape = evt.target.cfg.name;
      const node = <INode>item;
      const source = node.getID();
      const model = (<Item>item).getModel();
      const { x, y } = model;
      const point = this.getCanvasByPoint(x, y);


      if (shape === "right-plus") {
        const splitSource = source.split("-");
        const [group, index] = splitSource;
        
        let tragetId = splitSource.join("-");

        const item = this.findById(tragetId);
        if (item) {
          splitSource[1] = String(Number(splitSource[1]) + 1);
          tragetId = splitSource.join("-");
        }

        const NodeX = Number(point.x) + 300;
        if (this.width - NodeX < 400) {
          this.width = this.width + 400;
          this.changeSize(this.width, this.height);
        }

        const nodeResult = this.addItem("node", {
          id: tragetId,
          taskName: "none",
          role: NodeRole.Primary,
          x: Number(point.x) + 300,
          y: Number(point.y),
          anchorPoints: [
            [0, 0.5],
            [1, 0.5],
          ],
        });

        if (nodeResult == undefined && notify != undefined) {
          notify("add node exist or error")
        }

        const edgeResult = this.addItem("edge", {
          source: tragetId,
          target: source,
        });

        if (edgeResult == undefined && notify != undefined) {
          notify("add edge exist or error")
        }

        return;
      }

      if (shape === "left-plus") {
        const source = item._cfg.id;

        return;
      }

      if (cb) { cb(item) };
    });
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
    this.bindClickOnNode(null, (message: string) => { alert(message) });
    this.bindMouseenter();
    this.bindMouseleave();

    this.enableShowtime(data);
    this.enableAddNode(data);
    this.enableSubNode(data);

    this.data(data);
    this.setMode("addEdge");
  }
}