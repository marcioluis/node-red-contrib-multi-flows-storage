import * as fs from 'fs-extra';
import { FlowRead, Node } from "./models";
import { writeFlowFile } from './writeFlowFile';
import { flowManagerSettings } from './main';
import { load } from 'js-yaml';

/**
 * read a flow file
 * @param {string} filePath file to path
 * @param {boolean} ignoreObj true if ignore object read from flow
 * @returns an object
 */

export async function readFlowFile(filePath: string, ignoreObj?: boolean) {
	const retVal: FlowRead = {};

	const fileContentsStr = await fs.readFile(filePath, 'utf-8');
	retVal.str = fileContentsStr;

	if (ignoreObj) {
		retVal.mtime = (await fs.stat(filePath)).mtime;
		return retVal;
	}

	const indexOfExtension = filePath.lastIndexOf('.');
	const fileExt = filePath.substring(indexOfExtension + 1).toLowerCase();

	const finalObject: Node[] = fileExt === 'yaml' ? load(fileContentsStr) : JSON.parse(fileContentsStr);

	if (fileExt !== flowManagerSettings.fileFormat) {
		// File needs conversion
		const newFilePathWithNewExt = `${filePath.substring(0, indexOfExtension)}.${flowManagerSettings.fileFormat}`;
		await writeFlowFile(newFilePathWithNewExt, finalObject);

		// Delete old file
		await fs.remove(filePath);
		filePath = newFilePathWithNewExt;
	}

	retVal.mtime = (await fs.stat(filePath)).mtime;
	retVal.nodes = finalObject;

	return retVal;
}
