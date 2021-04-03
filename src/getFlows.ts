import * as fspath from 'path';
import * as fs from 'fs-extra';
import { createHash } from './utils';
import { FlowRead, FlowSummary, GlobalSummary, Node, SubflowSummary } from "./models";
import { readFlowFile } from './readFlowFile';
import { DIRECTORIES } from './main';

export async function loadFlows() {

	// const toReturn: FlowLoaded = {};
	const flowSummary: FlowSummary = {
		byNodeId: {},
		tabs: [],
		groups: [],
		nodes: [],
		groupedNodes: [],
		flowVersions: {},
		loadedFlowAndSubflowNames: {}
	};

	let filesnames = await fs.readdir(DIRECTORIES.flowsDir);
	filesnames = filesnames.filter(f => ['.json', '.yaml'].includes(fspath.extname(f).toLowerCase()));

	// foreach file name
	for (const name of filesnames) {
		try {
			// remove extension
			const itemname = name.replace(/\.\w+$/, '');
			const fpath = fspath.join(DIRECTORIES.flowsDir, name);
			const flowobj = await readFlowFile(fpath);

			let tab: Node;
			for (let i = flowobj.nodes.length - 1; i >= 0; i--) {
				const node = flowobj.nodes[i];
				flowSummary.byNodeId[node.id] = node;
				if (node.type === 'tab') {
					flowobj.nodes.splice(i, 1);
					flowSummary.tabs.push(node);
					tab = node;
				} else if (node.type === 'group') {
					flowobj.nodes.splice(i, 1);
					flowSummary.groups.push(node);
				} else if (typeof node.g === 'string') {
					flowobj.nodes.splice(i, 1);
					flowSummary.groupedNodes.push(node);
				}
			}
			if (!tab) {
				throw new Error('Could not find tab node in flow file');
			}

			flowSummary.nodes = [...flowSummary.nodes, ...flowobj.nodes];

			// flowSummary.flowVersions[itemname] = {
			// 	mtime: flowobj.mtime,
			// 	rev: createHash(flowobj.str)
			// };

			// flowSummary.loadedFlowAndSubflowNames[tab.id] = { type: tab.type, name: tab.label };

		} catch (e) {
			console.error(e)
		}
	}
	return flowSummary;
}

export async function loadSubflows() {

	// const toReturn: FlowLoaded = {}
	const flowSummary: SubflowSummary = {
		byNodeId: {},
		subflows: [],
		groups: [],
		nodes: [],
		groupedNodes: [],
		subflowVersions: {},
		loadedFlowAndSubflowNames: {}
	};

	let filesnames = await fs.readdir(DIRECTORIES.subflowsDir)
	filesnames = filesnames.filter(f => ['.json', '.yaml'].includes(fspath.extname(f).toLowerCase()));

	for (const name of filesnames) {
		try {
			const itemname = name.replace(/\.\w+$/, '');
			const fpath = fspath.join(DIRECTORIES.subflowsDir, name);
			const subflowobj = await readFlowFile(fpath);

			// find subflow node
			let subflowNode: Node;
			for (let i = subflowobj.nodes.length - 1; i >= 0; i--) {
				const node = subflowobj.nodes[i];
				flowSummary.byNodeId[node.id] = node;
				if (node.type === 'subflow') {
					flowSummary.subflows.push(node);
					subflowobj.nodes.splice(i, 1);
					subflowNode = node;
				} else if (node.type === 'group') {
					subflowobj.nodes.splice(i, 1);
					flowSummary.groups.push(node);
				} else if (typeof node.g === 'string') {
					subflowobj.nodes.splice(i, 1);
					flowSummary.groupedNodes.push(node);
				}
			}
			if (!subflowNode) {
				throw new Error('Could not find subflow node in flow file');
			}

			flowSummary.nodes = [...flowSummary.nodes, ...subflowobj.nodes]

			// flowSummary.subflowVersions[itemname] = {
			// 	rev: createHash(subflowobj.str),
			// 	mtime: subflowobj.mtime
			// };
			// flowSummary.loadedFlowAndSubflowNames[subflowNode.id] = {
			// 	type: subflowNode.type,
			// 	name: subflowNode.name
			// };
		} catch (e) {
			console.error(`Could not load subflow ${name}\r\n${e.stack}` || e);
		}
	}

	return flowSummary;
}

export async function loadAll() {
	const [flowsLoaded, subflowsLoaded, globalsLoaded] = await Promise.all([loadFlows(), loadSubflows(), loadConfigNodes()]);

	const nodes = [...flowsLoaded.nodes, ...subflowsLoaded.nodes]
	const groups = [...flowsLoaded.groups, ...subflowsLoaded.groups]
	const groupeds = [...flowsLoaded.groupedNodes, ...subflowsLoaded.groupedNodes]
	const globals = [...globalsLoaded.globals]

	const flows = [
		...flowsLoaded.tabs,
		...subflowsLoaded.subflows,
		...groups,
		...globals,
		...groupeds,
		...nodes]

	return flows
}

export async function loadConfigNodes() {
	// read config nodes
	let configFlowFile: FlowRead;
	const flowJsonSum: GlobalSummary = {
		byNodeId: {},
		globals: []
	}

	try {
		configFlowFile = await readFlowFile(DIRECTORIES.configNodesFilePath);
	} catch (e) {
		// await writeFlowFile(
		// 	`${directories.configNodesFilePathWithoutExtension}.${flowManagerSettings.fileFormat}`,
		// 	[]
		// );
		// configFlowFile = await readConfigFlowFile();
	}
	// flowJsonSum.globalVersion = {
	// 	rev: calculateRevision(configFlowFile.str),
	// 	mtime: configFlowFile.mtime
	// };
	for (const node of configFlowFile.nodes) {
		flowJsonSum.byNodeId[node.id] = node;
	}
	flowJsonSum.globals = [...flowJsonSum.globals, ...configFlowFile.nodes]

	return flowJsonSum;
}

export async function getFlows() {

	try {
		const flows = await loadAll();
		return flows;
	}
	catch (error) {
		console.log(error)
		return []
	}
}
