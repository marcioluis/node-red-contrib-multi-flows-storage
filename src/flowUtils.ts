import * as fspath from 'path';
import * as fs from 'fs-extra';
import { encodeFileName } from './utils';
import { Node } from "./models";
import { CONFIG_NODE_FILE_NAME, DIRECTORIES, flowModuleSettings } from './main';
import { writeFlowFile } from "./writeFlowFile";
import { checkIfRenamed, removeRenamed } from './duplicityChecker';

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

/**
 * separate tabs/subflows into files.
 * 
 * Node type tab or subflow become distinct files
 * 
 * @param flows all node's flows
 */
async function separeteFlows(flows: Node[]) {
	const flowNodes = new Map<string, Node[]>();
	const simpleNodes: Node[] = [];
	const configNodes: Node[] = [];

	for (let index = 0; index < flows.length; index++) {
		const node = flows[index];
		//add ordering to node
		node.flmOrder = node.flmOrder || index;
		if (node.type === 'tab' || node.type === 'subflow') {
			flowNodes.set(node.id, [node]);
			// checkDouble({nodeId: node.id, nodeName: node.label || node.name})
		} else if (!node.z || node.z.length === 0) {
			configNodes.push(node);
		} else {
			simpleNodes.push(node);
		}
	}
	for (const node of simpleNodes) {
		// z is for nodes inside tabs/subflows
		if (flowNodes.has(node.z)) {
			flowNodes.get(node.z).push(node);
		}
	}

	// writes
	const wpromises = [];

	// flowid is a tab or subflow id
	for (const flowId of flowNodes.keys()) {
		const nodesInFlow = flowNodes.get(flowId);
		const rootNode = nodesInFlow[0];
		const flowName = rootNode.label || rootNode.name; // label for tabs, name for subflows

		const dirName = rootNode.type === 'tab' ? DIRECTORIES.flowsDir : DIRECTORIES.subflowsDir;
		const fileName = `${encodeFileName(flowName)}.${flowModuleSettings.fileFormat}`;
		const destinationFile = fspath.resolve(dirName, fileName);

		const fd = checkIfRenamed(flowId, flowName);
		if (fd && fd.length) {
			removeRenamed({ baseDir: dirName, deleteFiles: fd, newFileName: fileName, newNodeName: flowName, nodeId: flowId });
		}
		wpromises.push(writeFlowFile(destinationFile, nodesInFlow));
	}

	const configDestination = fspath.resolve(DIRECTORIES.configNodesDir, `${CONFIG_NODE_FILE_NAME}.${flowModuleSettings.fileFormat}`)
	wpromises.push(writeFlowFile(configDestination, configNodes));

	try {
		await Promise.all(wpromises);
	} catch (error) {
		console.error('Error writing flows/subflows files', error);
	}
}
