import { createHash as hasher } from 'crypto'

export function createHash(str: string) {
	return hasher('md5').update(str).digest('hex')
}

export function encodeFileName(origName: string) {
	return origName
		.replace(/\\/g, '%5C')
		.replace(/\//g, '%2F')
		.replace(/:/g, '%3A')
		.replace(/\*/g, '%2A')
		.replace(/\?/g, '%3F')
		.replace(/\""/g, '%22')
		.replace(/</g, '%3C')
		.replace(/>/g, '%3E')
		.replace(/\|/g, '%7C');
	// Characters not allowed: \ / : * ? " < > |
}