import * as fs from 'fs-extra';
import { extname } from "path";
import { FlowRead, Node } from "./models";
import { load as yaml } from 'js-yaml';
import { syncFilesFormat } from './syncFilesFormat';

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

	const fileExt = extname(filePath).toLowerCase();
	const finalObject: Node[] = fileExt === '.yaml' ? yaml(fileContentsStr) : JSON.parse(fileContentsStr);

	filePath = await syncFilesFormat(filePath, finalObject);
	retVal.mtime = (await fs.stat(filePath)).mtime;
	retVal.nodes = finalObject;

	return retVal;
}
