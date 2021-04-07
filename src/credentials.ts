import * as fs from 'fs-extra'
import { DIRECTORIES, settings } from './main';

export async function getCredentials() {
    try {
        const cred = await fs.readJSON(DIRECTORIES.credentialsFile)
        return cred;
    } catch (e) {
        return {};
    }
}

export async function saveCredentials(credentials: any) {
    if (settings.readOnly) {
        return Promise.resolve()
    }

    let credentialData: any;
    if (settings.flowFilePretty) {
        credentialData = JSON.stringify(credentials, null, 4);
    } else {
        credentialData = JSON.stringify(credentials);
    }
    return fs.writeFile(DIRECTORIES.credentialsFile, credentialData)
}
