import * as fspath from 'path';
import * as fs from 'fs-extra';
import { encodeFileName } from './utils';
import { Node } from "./models";
import { CONFIG_NODE_FILE_NAME, DIRECTORIES, flowModuleSettings } from './main';
import { writeFlowFile } from "./writeFlowFile";

/**
 * migrate from big single flow.json to multi flows files
 * @returns
 */
export async function migrateFlowFile() {
	const masterJsonFlow: Node[] = await fs.readJSON(DIRECTORIES.flowFile);
	await separeteFlows(masterJsonFlow);
}

/**
 * save and separete all flows
 * @param flows flows array
 * @returns 
 */
export async function saveAndSepareFlow(flows: Node[]) {
	if (!flows || flows.length === 0) {
		return Promise.resolve()
	}
	await separeteFlows(flows);
}

async function separeteFlows(flows: Node[]) {
	const flowNodes: { [id: string]: Node[]; } = {};
	const simpleNodes: Node[] = [];
	const configNodes: Node[] = [];

	for (let index = 0; index < flows.length; index++) {
		const node = flows[index];
		//add ordering to node
		node.flmOrder = node.flmOrder || index;
		if (node.type === 'tab' || node.type === 'subflow') {
			flowNodes[node.id] = [node];
		} else if (!node.z || node.z.length === 0) {
			configNodes.push(node);
		} else {
			simpleNodes.push(node);
		}
	}
	for (const node of simpleNodes) {
		// z is for nodes inside tabs/subflows
		if (flowNodes[node.z]) {
			flowNodes[node.z].push(node);
		}
	}

	// writes
	const wpromises = [];

	for (const flowId of Object.keys(flowNodes)) {
		const nodesInFlow = flowNodes[flowId];
		const rootNode = nodesInFlow[0];
		const flowName = rootNode.label || rootNode.name; // label on tabs

		const dirName = rootNode.type === 'tab' ? DIRECTORIES.flowsDir : DIRECTORIES.subflowsDir;
		const fileName = `${encodeFileName(flowName)}.${flowModuleSettings.fileFormat}`;
		const destinationFile = fspath.resolve(dirName, fileName);

		wpromises.push(writeFlowFile(destinationFile, nodesInFlow));
	}

	const configDestination = fspath.resolve(DIRECTORIES.configNodesDir, `${CONFIG_NODE_FILE_NAME}.${flowModuleSettings.fileFormat}`)
	wpromises.push(writeFlowFile(configDestination, configNodes));
	await Promise.all(wpromises);
}
