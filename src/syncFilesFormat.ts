import * as fs from 'fs-extra';
import { Node } from "./models";
import { writeFlowFile } from './writeFlowFile';
import { flowModuleSettings } from './main';

/**
 * sync file format of flows files.
 *
 * if path is .json and this module is configured to save .yaml, deletes .json files and
 * saves .yaml and vice-versa
 *
 * @param filePath absolute path to file
 * @param flow flow array
 * @returns the new absolute  path
 */
export async function syncFilesFormat(filePath: string, flow: Node[]) {

	const indexOfExtension = filePath.lastIndexOf('.');
	const fileExt = filePath.substring(indexOfExtension + 1).toLowerCase();

	// File needs conversion?
	if (fileExt !== flowModuleSettings.fileFormat) {
		const newFilePathWithNewExt = `${filePath.substring(0, indexOfExtension)}.${flowModuleSettings.fileFormat}`;
		// Delete old file and write the new one with new extension
		await Promise.all([writeFlowFile(newFilePathWithNewExt, flow), fs.remove(filePath)]);

		return newFilePathWithNewExt;
	}

	return filePath;
}
