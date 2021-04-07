import { readFlowFile } from './readFlowFile';
import { DIRECTORIES } from './main';

/**
 * load all config nodes
 * @returns array of nodes
 */

export async function loadConfigNodes() {
	try {
		const configFlowFile = await readFlowFile(DIRECTORIES.configNodesFilePath);
		return [...configFlowFile.nodes];
	} catch (e) {
		return [];
	}
}
