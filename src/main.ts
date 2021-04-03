import { diretorios } from "./models";
import { buildDirectories } from './buildDirectories';
import { checkIfMigrationIsRequried } from './checkIfMigrationIsRequried';
import { migrateFlowFile } from './migrateFlowFile';
import { getFlows } from "./getFlows";

export const DIRECTORIES: diretorios = {};
export const DIR_NAME_FLOW = 'flows';
export const DIR_NAME_SUBFLOW = 'subflows';
export const CONFIG_NODE_FILE_NAME = 'config-nodes';
export let settings: any;

export const flowManagerSettings = {
	fileFormat: 'json'
};

/**
 * initialize this storage module
 * @param _settings node red settings
 * @param runtime node res runteim
 * @returns 
 */
async function init(_settings: object, runtime?: object) {
	settings = _settings;

	await buildDirectories();

	console.info(DIRECTORIES);

	const isMigrationNeeded = await checkIfMigrationIsRequried();
	if (isMigrationNeeded) {
		await migrateFlowFile();
	}

	return Promise.resolve();
}

// module.exports = {
// 	init: init,
// 	getFlows: () => Promise.resolve([]),
// 	getCredentials: () => Promise.resolve('')
// };

module.exports = {
	init: init,
	getFlows: getFlows,
	getCredentials: () => Promise.resolve('')
};
