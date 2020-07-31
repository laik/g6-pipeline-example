import "./register-shape";
import { Graph } from "@antv/g6";
import { Item, GraphData, IAlgorithmCallbacks } from '@antv/g6/lib/types';
import { INode, IEdge } from "@antv/g6/lib/interface/item";
import { PipelineGraphOptions, PipelineGraphData, PipelineNodeConfig, NodeRole, getGroupId, getIndexId, getPrimaryNodeId, spacingY, spacingX } from "./common";
import { Algorithm } from '@antv/g6'
import { IGraph } from "@antv/g6/lib/interface/graph";


const { depthFirstSearch, breadthFirstSearch } = Algorithm;

declare type SearchAlgorithm0 = (graph: IGraph) => void;
declare type SearchAlgorithm1 = (graph: IGraph, startNodeId: string, originalCallbacks?: IAlgorithmCallbacks) => void;


export class PipelineGraph extends Graph {
  private width: number = 0;
  private height: number = 0;

  constructor(width: number, height: number, cfg: PipelineGraphOptions) {
    super(cfg);
    this.width = width;
    this.height = height;
  }

  private searchChildMove(id: string, search: SearchAlgorithm0 | SearchAlgorithm1) {
    search(this, id, {
      enter: ({ current, previous }) => {
        console.log("current==>", current, "previous=>", previous);
      },
      leave: ({ current, previous }) => {
        // 遍历完节点的回调
      },
    })
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
        // this.removeEdge(node);
        this.removeItem(source.getID());
      }

      if (cb) { cb(item) };
    });
  }

  private addNode(sourceId: string, targetId: string, x: number, y: number) {
    const sourceGroupId = getGroupId(sourceId)
    const indexId = getIndexId(targetId);
    const pipelineNodeConfig: PipelineNodeConfig = {
      id: targetId,
      taskName: ["none", targetId].join("-"),
      role: indexId > 1 ? NodeRole.Second : NodeRole.Primary,
      x: Number(x) + spacingX,
      y: Number(y) + ((indexId - 1) * spacingY),
      linkPoints: {
        right: true,
        left: true,
      },
    }
    this.addItem("node", pipelineNodeConfig)

    if (indexId > 1) {
      this.getNodes()
        .find((node: INode) => {
          return node.getID() == getPrimaryNodeId(targetId)
        })
        .getNeighbors()
        .map((pnode: INode) => {
          if (getIndexId(pnode.getID()) == 1) {
            this.addItem("edge", {
              source: targetId,
              target: pnode.getID(),
              type: "cubic-horizontal",
              style: {
                stroke: "#959DA5",
                lineWidth: 2,
              },
            });
          }
        });
    } else {
      this.getNodes()
        .map((node: INode) => {
          if (getGroupId(node.getID()) == (getGroupId(targetId) - 1)) {
            this.addItem("edge", {
              source: node.getID(),
              target: targetId,
              type: "cubic-horizontal",
              style: {
                stroke: "#959DA5",
                lineWidth: 2,
              },
            });
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
    // TODO
    // 如果有子节点,那么需要将子节点上移, 有点问题,需要全部shape一起移.... ?
    this.getNodes().
      map((_node: INode) => {
        if (getGroupId(_node.getID()) == getGroupId(node.getID()) && getIndexId(_node.getID()) > getIndexId(node.getID())) {
          console.log("move node", _node.getID())
          _node.updatePosition({ x: _node.getModel().x, y: _node.getModel().y - spacingY });
          _node.getEdges()?.map((edge: IEdge) => {
            const model = edge.getModel();
            this.removeItem(edge);
            this.addItem("edge", model);
            console.log('remove and add edge', model.source);
          });
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
      this.searchChildMove((<INode>evt.item).getID(), depthFirstSearch);
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