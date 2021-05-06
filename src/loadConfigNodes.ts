import { readFlowFile } from './readFlowFile';
import { DIRECTORIES } from './main';
import { readdir } from 'fs-extra';
import { extname, join } from 'path';

/**
 * load all config nodes
 * @returns array of nodes
 */

export async function loadConfigNodes() {
	let cnodes = []

	let filesnames = await readdir(DIRECTORIES.configNodesDir)
	filesnames = filesnames.filter(f => ['.json', '.yaml'].includes(extname(f).toLowerCase()));

	for (const name of filesnames) {
		try {
			const fpath = join(DIRECTORIES.configNodesDir, name)
			const configFlowFile = await readFlowFile(fpath);
			cnodes = [...cnodes, ...configFlowFile.nodes]
		} catch (e) { }
	}
	
	return cnodes;
}
