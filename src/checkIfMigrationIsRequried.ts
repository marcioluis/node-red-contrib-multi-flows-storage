import * as fs from 'fs-extra';
import { DIRECTORIES } from './main';

/**
 * return true if is necessary to migrate the flow file
 * @returns true or false
 */
export async function checkIfMigrationIsRequried() {
	try {
		const isFlowsDirEmpty = (await fs.readdir(DIRECTORIES.flowsDir)).length === 0;
		const isSubFlowsDirEmpty = (await fs.readdir(DIRECTORIES.subflowsDir)).length === 0;
		await fs.access(DIRECTORIES.flowFile);

		if (isFlowsDirEmpty && isSubFlowsDirEmpty) {
			return true;
		}
	} catch (e) {
		console.error('error checking if migrations is required', e);
		return false;
	}
	return false;
}
