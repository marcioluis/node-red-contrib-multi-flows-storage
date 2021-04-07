import { NodeDef } from "node-red";

export interface Node extends NodeDef {
    g?: string,
    label?: string,
    flmOrder?: number
}

export interface diretorios {
    basePath?: string,
    flowsDir?: string,
    subflowsDir?: string,
    credentialsFile?: string,
    flowFile?: string,
    configNodesFilePathWithoutExtension?: string,
    configNodesFilePath?: string,
    envNodesDir?: string,
    flowManagerCfg?: string,
    nodesOrderFilePath?: string,
}

export interface FlowRead {
    str?: string,
    mtime?: Date,
    nodes?: Node[]
}

export interface Summary {
    nodes: Node[],
}

export interface FlowSummary extends Summary {
    tabs: Node[]
}

export interface SubflowSummary extends Summary {
    subflows: Node[]
}

export interface GlobalSummary extends Summary {
}

export interface FlowLoaded {
    flows?: Node[],
    rev?: string
}