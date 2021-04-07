import { diretorios } from "./models";
import { buildDirectories } from './buildDirectories';
import { checkIfMigrationIsRequried } from './checkIfMigrationIsRequried';
import { migrateFlowFile } from './flowUtils';
import { getCredentials, saveCredentials } from "./credentials";
import redsettings from "@node-red/runtime/lib/storage/localfilesystem/settings";
import redsessions from "@node-red/runtime/lib/storage/localfilesystem/sessions";
import redlibrary from "@node-red/runtime/lib/storage/localfilesystem/library";
import { getFlows, saveFlows } from "./flows";

export const DIRECTORIES: diretorios = {};
export const DIR_NAME_FLOW = 'flows';
export const DIR_NAME_SUBFLOW = 'subflows';
export const CONFIG_NODE_FILE_NAME = 'config-nodes';

export let settings: any;

export const flowManagerSettings = {
	fileFormat: 'yaml'
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

	const isMigrationNeeded = await checkIfMigrationIsRequried();
	if (isMigrationNeeded) {
		await migrateFlowFile();
	}

	// initialize default node-red modules
	redsessions.init(settings);
	redsettings.init(settings);
	await redlibrary.init(settings);
}

module.exports = {
	init: init,
	getFlows: getFlows,
	saveFlows: saveFlows,
	getCredentials: getCredentials,
	saveCredentials: saveCredentials,

	getSettings: redsettings.getSettings,
	saveSettings: redsettings.saveSettings,
	getSessions: redsessions.getSessions,
	saveSessions: redsessions.saveSessions,
	getLibraryEntry: redlibrary.getLibraryEntry,
	saveLibraryEntry: redlibrary.saveLibraryEntry
};
