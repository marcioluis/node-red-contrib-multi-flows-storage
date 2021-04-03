import { NodeDef } from "node-red";

export interface Node extends NodeDef {
    g?: string
    label?: string
}

export interface diretorios {
    basePath?: string,
    flowsDir?: string,
    subflowsDir?: string,
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
    byNodeId?: { [id: string]: Node },
    nodes?: Node[],
    groups?: Node[],
    groupedNodes?: Node[],
    loadedFlowAndSubflowNames?: {
        [id: string]: {
            type?: string,
            name?: string
        }
    }
}

export interface FlowSummary extends Summary {
    tabs?: Node[],
    flowVersions?: {
        [name: string]: {
            rev?: string,
            mtime?: Date
        }
    }
}

export interface SubflowSummary extends Summary {
    subflows?: Node[],
    subflowVersions?: {
        [name: string]: {
            rev?: string,
            mtime?: Date
        }
    },
}

export interface GlobalSummary extends Summary {
    globals?: Node[],
    globalVersion?: {
        [name: string]: {
            rev?: string,
            mtime?: Date
        }
    }
}

export interface FlowLoaded {
    flows?: Node[],
    rev?: string
}