import { loadConfigNodes } from "./loadConfigNodes";
import { loadFlows } from "./loadFlows";
import { loadSubflows } from "./loadSubflows";
import { settings } from "./main";
import { saveAndSepareFlow } from "./flowUtils";

export async function getFlows() {
  try {
    const [flowsRead, subflowsRead, configsNodes] = await Promise.all([
      loadFlows(),
      loadSubflows(),
      loadConfigNodes(),
    ]);

    const nodes = [...flowsRead.nodes, ...subflowsRead.nodes, ...configsNodes];
    const flows = [
      ...flowsRead.tabs.sort(
        (f1, f2) => (f1.flmOrder || 0) - (f2.flmOrder || 0)
      ),
      ...subflowsRead.subflows.sort((f1, f2) => (f1.name < f2.name ? -1 : 1)),
      ...nodes.sort((f1, f2) => (f1.id < f2.id ? -1 : 1)),
    ];
    return flows;
  } catch (error) {
    console.log(`Error geting flows`, error);
    return [];
  }
}

export async function saveFlows(flows: any) {
  if (settings.readOnly) {
    return Promise.resolve();
  }
  await saveAndSepareFlow(flows);
}
