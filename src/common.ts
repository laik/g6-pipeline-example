import { GraphOptions, GraphData, NodeConfig, ModelConfig, Item, TreeGraphData, EdgeConfig } from '@antv/g6/lib/types';
import { INode } from '@antv/g6/lib/interface/item';

export const graphId = "container"

export const pipelineNode: string = "pipeline-node";

export enum NodeRole {
    Primary,
    Second,
}

export enum NodeStatus {
    Pending,
    Failed,
    Running,
    Progress,
    Succeeded,
    Cancel,
    Timeout,
}

export interface PipelineGraphOptions extends GraphOptions {

}

export interface PipelineGraphConfig extends ModelConfig {

}

export interface PipelineNodeConfig extends NodeConfig {
    role?: NodeRole,
    status?: NodeStatus,
    taskName?: string;
    showtime?: boolean;
    addnode?: boolean,
    subnode?: boolean,
}

export interface PipelineEdgeConfig extends EdgeConfig {

}

export interface PipelineGraphData extends GraphData {
    nodes?: PipelineNodeConfig[];
    edges?: PipelineEdgeConfig[];
}


export function getGroupId(id: string): number {
    if (id.split("-").length == 2) {
        return Number(id.split("-")[0]);
    }
    return -1;
}

export function getIndexId(id: string): number {
    if (id.split("-").length == 2) {
        return Number(id.split("-")[1]);
    }
    return -1;
}

export function getPrimaryNodeId(id: string): string {
    return [getGroupId(id), "1"].join("-");
}

export function buildNodeConfig(id: string, x: number, y: number): PipelineNodeConfig {
    const node: PipelineNodeConfig = {
        id: id,
        x: x,
        y: y,
        role: NodeRole.Second,
        anchorPoints: [
            [0, 0.5],
            [1, 0.5],
        ],
    };
    if (id.endsWith("1", 1)) {
        node.role = NodeRole.Primary
    }
    return node;
}

export const defaultInitGraphNode: PipelineNodeConfig = {
    id: "1-1",
    x: 20,
    y: 20,
    role: NodeRole.Primary,
    taskName: "none",
    anchorPoints: [
        [0, 0.5],
        [1, 0.5],
    ],
}

export const defaultInitData: PipelineGraphData = {
    nodes: [defaultInitGraphNode]
}

export const defaultCfg: PipelineGraphOptions = {
    container: graphId,
    width: 1200,
    height: 800,
    renderer: "svg",
    autoPaint: true,

    defaultEdge: {
        type: "Line",
        style: {
            stroke: "#959DA5",
            lineWidth: 4,
        },
    },

    defaultNode: {
        type: pipelineNode,
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

