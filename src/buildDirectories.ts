import * as fspath from 'path';
import * as fs from 'fs-extra';
import { settings, DIRECTORIES, DIR_NAME_FLOW, DIR_NAME_SUBFLOW, CONFIG_NODE_FILE_NAME, flowManagerSettings } from './main';

/**
 * build the initial dirs
 *
 */
export async function buildDirectories() {
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
					fs.ensureDir(fspath.join(settings.userDir, 'node_modules'));
				}
			}
		}
	}

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
			basePath = fspath.join(settings.userDir, `flows_${require('os').hostname()}`);
			credPath = fspath.join(settings.userDir, `flows_${require('os').hostname()}_cred.json`)
		}

		Object.assign(DIRECTORIES, {
			basePath,
			flowsDir: fspath.resolve(basePath, DIR_NAME_FLOW),
			subflowsDir: fspath.resolve(basePath, DIR_NAME_SUBFLOW),
			credentialsFile: credPath,
			flowFile: fspath.resolve(
				settings.userDir,
				settings.flowFile || `flows_${require('os').hostname()}`
			),
			configNodesFilePath: `${fspath.resolve(basePath, CONFIG_NODE_FILE_NAME)}.${flowManagerSettings.fileFormat}`
		});

		// make dir
		if (!settings.readOnly) {
			await Promise.all([fs.ensureDir(DIRECTORIES.flowsDir), fs.ensureDir(DIRECTORIES.subflowsDir)])
		}
	} catch (e) {
		console.error('error creating directories', e);
	}
}
