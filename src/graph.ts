import "./register-shape";
import { Graph } from "@antv/g6";
import { Item, GraphData, IAlgorithmCallbacks } from '@antv/g6/lib/types';
import { INode, IEdge } from "@antv/g6/lib/interface/item";
import { PipelineGraphOptions, PipelineGraphData, PipelineNodeConfig, NodeRole, getGroupId, getIndexId, getPrimaryNodeId, spacingY, spacingX, subNodes, hasSubNode, groupNodes, hasRightNeighborNode } from "./common";
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
        const [group, index] = sourceId.split("-");
        const nextGroup = String(Number(group) + 1);
        let targetId = [nextGroup, index].join("-");
        let nodeLayoutIndex: number = 0;

        if (this.findById(targetId) != undefined) {
          const groupNodeSortList = groupNodes(<INode>this.findById(targetId))
          targetId = [nextGroup, String(getIndexId(groupNodeSortList[groupNodeSortList.length - 1].getID()) + 1)].join("-");
          nodeLayoutIndex = groupNodeSortList.length;
        }

        this.addNode(sourceId, targetId, Number(point.x), Number(point.y), nodeLayoutIndex);
      }

      if (shape === "left-plus") {
        const source = (<INode>item);
        this.moveNode(node);
        this.removeNode(source);
      }

      if (cb) { cb(item) };
    });
  }

  private removeNode(node: INode) {
    if (hasRightNeighborNode(node) && getIndexId(node.getID()) == 1) {
      alert("Illegal operation");
      return;
    }
    this.removeItem(node.getID());
  }

  private addNode(sourceId: string, targetId: string, x: number, y: number, nodeLayoutIndex: number) {
    const nodeIndexId = getIndexId(targetId);
    const pipelineNodeConfig: PipelineNodeConfig = {
      id: targetId,
      taskName: ["node", targetId].join("-"),
      role: nodeIndexId > 1 ? NodeRole.Second : NodeRole.Primary,
      x: Number(x) + spacingX,
      y: Number(y) + (nodeLayoutIndex * spacingY),
      linkPoints: {
        right: true,
        left: true,
      },
    }

    if (this.addItem("node", pipelineNodeConfig) == undefined) {
      return
    }

    if (nodeIndexId > 1) {
      this.getNodes()
        ?.find((node: INode) => {
          return node.getID() == getPrimaryNodeId(targetId)
        })
        ?.getNeighbors()
        ?.map((pnode: INode) => {
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
        ?.map((node: INode) => {
          if (getGroupId(node.getID()) == (getGroupId(targetId) - 1)) {
            this.addItem("edge",
              {
                source: node.getID(),
                target: targetId,
                type: "cubic-horizontal",
                // curvePosition: 1,
                curveOffset: 20,
                style: {
                  stroke: "#959DA5",
                  lineWidth: 2,
                },
              });
          }
        })
    }
  }


  private moveNode(node: INode) {
    // 如果有子节点,那么需要将子节点上移, 有点问题,需要全部shape一起移.... ?
    if (!hasSubNode(node)) {
      return;
    }

    this.getNodes()
      ?.map((needUpdateNode: INode) => {
        if (getGroupId(needUpdateNode.getID()) == getGroupId(node.getID()) && getIndexId(needUpdateNode.getID()) > getIndexId(node.getID())) {
          console.log("move node", needUpdateNode.getID());

          needUpdateNode.updatePosition({
            x: needUpdateNode.getModel().x,
            y: needUpdateNode.getModel().y - spacingY,
          });

          const needUpdateEdgeCfg = needUpdateNode.getEdges()
            ?.map((edge: IEdge) => {
              return { id: edge.getID(), source: edge.getModel().source, target: edge.getModel().target };
            });

          if (needUpdateEdgeCfg == undefined || needUpdateEdgeCfg.length == 0) {
            return
          }
          needUpdateEdgeCfg.map((cfg: { id: string, source: string, target: string }) => {
            this.remove(cfg.id);
            this.addItem("edge", {
              source: cfg.source,
              target: cfg.target,
              type: "cubic-horizontal",
              style: {
                stroke: "#959DA5",
                lineWidth: 2,
              },
            });
          })
        }
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