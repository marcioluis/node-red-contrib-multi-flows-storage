import { loadConfigNodes } from "./loadConfigNodes";
import { loadFlows } from "./loadFlows";
import { loadSubflows } from "./loadSubflows";
import { settings } from "./main";
import { saveAndSepareFlow } from "./flowUtils";

export async function getFlows() {
    try {
        const [flowsRead, subflowsRead, configsNodes] = await Promise.all([loadFlows(), loadSubflows(), loadConfigNodes()]);

        const nodes = [...flowsRead.nodes, ...subflowsRead.nodes, ...configsNodes]
        const flows = [
            ...flowsRead.tabs,
            ...subflowsRead.subflows,
            ...nodes
        ]
        return flows.sort((f1, f2) => f1.flmOrder - f2.flmOrder);

    } catch (error) {
        console.log(`Error geting flows`, error)
        return []
    }
}

export async function saveFlows(flows: any) {
    if (settings.readOnly) {
        return Promise.resolve();
    }
    await saveAndSepareFlow(flows);
}