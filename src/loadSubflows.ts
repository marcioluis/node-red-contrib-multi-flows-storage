import * as fspath from 'path';
import * as fs from 'fs-extra';
import { Node, SubflowSummary } from "./models";
import { readFlowFile } from './readFlowFile';
import { DIRECTORIES } from './main';
import { addFileForDuplicityControl } from './duplicityChecker';

/**
 * load all subflows
 * @returns summary of all subflows
 */

export async function loadSubflows() {

	const flowSummary: SubflowSummary = {
		subflows: [],
		nodes: []
	};

	const ext = {
		'.json': true,
		'.yaml': true,
	}

	let filesnames = await fs.readdir(DIRECTORIES.subflowsDir);
	filesnames = filesnames.filter(f => {
		const e = fspath.extname(f).toLowerCase();
		return ext[e];
	});

	for (const name of filesnames) {
		try {
			const fpath = fspath.join(DIRECTORIES.subflowsDir, name);
			const subflowobj = await readFlowFile(fpath);

			// find subflow node
			let subflowNode: Node;
			for (let i = subflowobj.nodes.length - 1; i >= 0; i--) {
				const node = subflowobj.nodes[i];

				addFileForDuplicityControl(name, node);
				if (node.type === 'subflow') {
					flowSummary.subflows.push(node);
					subflowNode = node;
				} else {
					flowSummary.nodes.push(node);
				}
			}
			if (!subflowNode) {
				throw new Error('Could not find subflow node in flow file');
			}
		} catch (e) {
			console.error(`Could not load subflow ${name}\r\n${e.stack}` || e);
		}
	}

	return flowSummary;
}
