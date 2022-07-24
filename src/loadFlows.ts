import * as fspath from 'path';
import * as fs from 'fs-extra';
import { FlowSummary, Node } from "./models";
import { readFlowFile } from './readFlowFile';
import { DIRECTORIES } from './main';
import { addFileForDuplicityControl } from './duplicityChecker';

/**
 * load all flows
 * @returns summary of flows
 */

export async function loadFlows() {

	const flowSummary: FlowSummary = {
		nodes: [],
		tabs: []
	};

	const ext = {
		'.json': true,
		'.yaml': true,
	}

	let filesnames = await fs.readdir(DIRECTORIES.flowsDir);
	filesnames = filesnames.filter(f => {
		const e = fspath.extname(f).toLowerCase();
		return ext[e];
	});

	// foreach file name
	for (const name of filesnames) {
		try {
			const fpath = fspath.join(DIRECTORIES.flowsDir, name);
			const flowobj = await readFlowFile(fpath);

			let tab: Node;
			for (let i = flowobj.nodes.length - 1; i >= 0; i--) {
				const node = flowobj.nodes[i];

				addFileForDuplicityControl(name, node);
				if (node.type === 'tab') {
					flowSummary.tabs.push(node);
					tab = node;
				} else {
					flowSummary.nodes.push(node);
				}
			}
			if (!tab) {
				throw new Error('Could not find tab node in flow file');
			}
		} catch (e) {
			console.error(`Could not load flow ${name}\r\n${e.stack}` || e);
		}
	}
	return flowSummary;
}
