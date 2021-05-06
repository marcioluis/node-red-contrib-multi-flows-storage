import * as fspath from 'path';
import * as fs from 'fs-extra';
import { hostname } from "os";
import { settings, DIRECTORIES, DIR_NAME_FLOW, DIR_NAME_SUBFLOW, DIR_NAME_GLOBAL } from './main';

/**
 * build user dir.
 * same as node-red
 */
export async function buildUserDir() {
	// copy from node-red localfilesystem
	// build user dir
	if (!settings.userDir) {
		try {
			fs.statSync(fspath.join(process.env.NODE_RED_HOME, '.config.json'));
			settings.userDir = process.env.NODE_RED_HOME;
		} catch (err) {
			try {
				// Consider compatibility for older versions
				if (process.env.HOMEPATH) {
					fs.statSync(fspath.join(process.env.HOMEPATH, '.node-red', '.config.json'));
					settings.userDir = fspath.join(process.env.HOMEPATH, '.node-red');
				}
			} catch (err) { }

			if (!settings.userDir) {
				settings.userDir = fspath.join(
					process.env.HOME ||
					process.env.USERPROFILE ||
					process.env.HOMEPATH ||
					process.env.NODE_RED_HOME,
					'.node-red'
				);
				if (!settings.readOnly) {
					await fs.ensureDir(fspath.join(settings.userDir, 'node_modules'));
				}
			}
		}
	}
}
/**
 * build the initial dirs
 *
 */
export async function buildModuleDirectories() {
	// build basepath
	try {
		let basePath: string;
		let credPath: string;
		if (settings.flowFile) {
			const ffext = fspath.extname(settings.flowFile)
			const ffname = fspath.basename(settings.flowFile, ffext)
			basePath = fspath.join(settings.userDir, ffname);
			credPath = fspath.join(settings.userDir, `${ffname}_cred${ffext}`);
		} else {
			basePath = fspath.join(settings.userDir, `flows_${hostname()}`);
			credPath = fspath.join(settings.userDir, `flows_${hostname()}_cred.json`)
		}

		// base path for new flows: userdir/flowfilename/**
		DIRECTORIES.basePath = basePath;
		// new flows dir: userdir/flowfilename/flows
		DIRECTORIES.flowsDir = fspath.resolve(basePath, DIR_NAME_FLOW);
		// new subflows dir: userdir/flowfilename/subflows
		DIRECTORIES.subflowsDir = fspath.resolve(basePath, DIR_NAME_SUBFLOW);
		// absolute path to credentials file: userdir/flowfilename_cred.json
		DIRECTORIES.credentialsFile = credPath;
		// old path to flow file, comes form node-red settings or default to flows_hostname.json
		DIRECTORIES.flowFile = fspath.resolve(settings.userDir, settings.flowFile || `flows_${hostname()}.json`);
		// new config path: userdir/flowfilename/global
		DIRECTORIES.configNodesDir = fspath.resolve(basePath, DIR_NAME_GLOBAL);

		// make dir
		if (!settings.readOnly) {
			await Promise.all([fs.ensureDir(DIRECTORIES.flowsDir), fs.ensureDir(DIRECTORIES.subflowsDir)])
		}
	} catch (e) {
		console.error('error creating directories', e);
	}
}
