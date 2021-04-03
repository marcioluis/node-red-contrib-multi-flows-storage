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
		if (settings.flowFile) {
			const [filename] = settings.flowFile.match(/[\w_-]+\.\w+$/);
			basePath = fspath.join(settings.userDir, filename.replace(/\.\w+$/, ''));
		} else {
			basePath = fspath.join(settings.userDir, `flows_${require('os').hostname()}`);
		}

		Object.assign(DIRECTORIES, {
			basePath,
			flowsDir: fspath.resolve(basePath, DIR_NAME_FLOW),
			subflowsDir: fspath.resolve(basePath, DIR_NAME_SUBFLOW),
			flowFile: fspath.resolve(
				settings.userDir,
				settings.flowFile || `flows_${require('os').hostname()}`
			),
			configNodesFilePathWithoutExtension: fspath.resolve(basePath, CONFIG_NODE_FILE_NAME),
			configNodesFilePath: `${fspath.resolve(basePath, CONFIG_NODE_FILE_NAME)}.${flowManagerSettings.fileFormat}`,
			envNodesDir: fspath.resolve(basePath, 'envnodes'),
			flowManagerCfg: fspath.resolve(basePath, 'flows-cfg.json'),
			nodesOrderFilePath: fspath.resolve(basePath, 'flow-manager-nodes-order.json')
		});

		// make dir
		if (!settings.readOnly) {
			await fs.ensureDir(DIRECTORIES.flowsDir);
			await fs.ensureDir(DIRECTORIES.subflowsDir);
		}
	} catch (e) {
		console.error('error creating directories', e);
	}
}
