import * as fs from 'fs-extra';
import * as fspath from "path";
import { Node } from "./models";
import { readFlowFile } from "./readFlowFile";
import * as YAML from "js-yaml";
import { flowManagerSettings, settings } from './main';

/**
 * write a flow file
 * @param filePath path to write flow file
 * @param flowStrOrArray array with nodes or the string contents
 * @returns
 */
export async function writeFlowFile(filePath: string, flowStrOrArray: string | Node[]) {

	async function isReallyChanged(newObj: Node[]) {
		try {
			const oldNodes = (await readFlowFile(filePath)).nodes;
			const oldSet = new Set(oldNodes.map(item => JSON.stringify(item)));
			const newSet = new Set(newObj.map(item => JSON.stringify(item)));

			if (oldSet.size !== newSet.size) {
				return true;
			};

			newSet.forEach((item) => {
				if (!oldSet.has(item))
					throw 'Found change';
			});
		} catch (e) {
			return true;
		}
		return false;
	}

	let str: string;
	let changed: boolean;
	const ext = fspath.extname(filePath);
	const { fileFormat } = flowManagerSettings

	if (typeof flowStrOrArray === 'string') {
		const content = ext === '.yaml' ? YAML.load(flowStrOrArray) : JSON.parse(flowStrOrArray);
		changed = await isReallyChanged(content);
		str = flowStrOrArray;
	} else {
		changed = await isReallyChanged(flowStrOrArray);
		if (fileFormat === 'yaml') {
			str = YAML.dump(flowStrOrArray)
		} else {
			if (settings.flowFilePretty) {
				str = JSON.stringify(flowStrOrArray, null, 4);
			} else {
				str = JSON.stringify(flowStrOrArray);
			}
		}
	}

	if (changed) {
		await fs.outputFile(filePath, str);
	}
}
