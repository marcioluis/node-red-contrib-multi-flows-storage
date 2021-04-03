import * as fs from 'fs-extra';
import { Node } from "./models";
import { readFlowFile } from "./readFlowFile";

/**
 * write a flow file
 * @param filePath path to write flow file
 * @param flowStrOrArray array with nodes or the string contents
 * @returns
 */
export async function writeFlowFile(filePath: string, flowStrOrArray: string | Node[]) {
	let str: string;

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

	let changed: boolean;
	if (typeof flowStrOrArray === 'string') {
		// changed = await isReallyChanged(
		// 	filePath.endsWith('.yaml') ? YAML.safeLoad(flowStrOrObject) : JSON.parse(flowStrOrObject)
		// );
		changed = await isReallyChanged(JSON.parse(flowStrOrArray));
		str = flowStrOrArray;
		//} else if (flowManagerSettings.fileFormat === 'yaml') {
		//changed = await isReallyChanged(flowStrOrObject);
		//str = YAML.safeDump(flowStrOrObject);
	} else {
		changed = await isReallyChanged(flowStrOrArray);
		// str = stringifyFormattedFileJson(flowStrOrObject);
		str = JSON.stringify(flowStrOrArray, undefined, 2);
	}

	if (changed) {
		await fs.outputFile(filePath, str);
	}
	return str;
}
