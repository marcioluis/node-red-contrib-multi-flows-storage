import redlibrary from "@node-red/runtime/lib/storage/localfilesystem/library";
import redsessions from "@node-red/runtime/lib/storage/localfilesystem/sessions";
import redsettings from "@node-red/runtime/lib/storage/localfilesystem/settings";
import { readJson } from "fs-extra";
import { resolve } from "path";
import { buildModuleDirectories, buildUserDir } from './buildDirectories';
import { checkIfMigrationIsRequried } from './checkIfMigrationIsRequried';
import { getCredentials, saveCredentials } from "./credentials";
import { getFlows, saveFlows } from "./flows";
import { migrateFlowFile } from './flowUtils';
import { diretorios, FlowModuleOptions } from "./models";

export const DIRECTORIES: diretorios = {};
export const DIR_NAME_FLOW = 'flows';
export const DIR_NAME_SUBFLOW = 'subflows';
export const CONFIG_NODE_FILE_NAME = 'config-nodes';
export const flowModuleSettings: FlowModuleOptions = {
	fileFormat: 'yaml'
};

export let settings: any;

/**
 * initialize this storage module
 * @param _settings node red settings
 * @param runtime node res runteim
 * @returns 
 */
async function init(_settings: object, runtime?: object) {

	settings = _settings;

	await buildUserDir()

	try {
		// this module options file
		const options = await readJson(resolve(settings.userDir, 'flowsmodule-options.json'));
		Object.assign(flowModuleSettings, options)
		const { fileFormat } = flowModuleSettings
		if (!fileFormat || fileFormat.length === 0 || !['json', 'yaml'].includes(fileFormat)) {
			flowModuleSettings.fileFormat = 'yaml';
		}
	} catch (e) { }

	await buildModuleDirectories();

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
}