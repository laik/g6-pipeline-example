import { GraphOptions, GraphData, NodeConfig, ModelConfig, Item, TreeGraphData, EdgeConfig } from '@antv/g6/lib/types';
import { INode } from '@antv/g6/lib/interface/item';

export const graphId = "container"

export const nodeNamed: string = "pipeline-node";

export const eventNames = [
    'primary-hover'
];

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


const defaultInitGraphNode: PipelineNodeConfig = {
    id: "0-0",
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
    height: 300,
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
        type: nodeNamed,
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

