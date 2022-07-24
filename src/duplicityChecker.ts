import { remove } from "fs-extra";
import { resolve } from "path";
import { FileControl, Node, RemoveOptions } from "./models";

const files = new Map<string, FileControl[]>();

/**
 * add a file name and its processed Node for duplicity control that could happen
 * on rename for example.
 * 
 * @param fileName file name
 * @param node nodeRed node 
 */
export function addFileForDuplicityControl(fileName: string, node: Node) {
    const { id, type, name, label } = node;
    // only tabs and subflows types are added because they are used as files
    if (type === 'tab' || type === 'subflow') {
        if (files.has(id)) {
            files.get(id).push({ nodeName: label || name, fileName });
        } else {
            files.set(id, [{ nodeName: label || name, fileName }])
        }
    }
}

/**
 * check if the node (tab/subflow) was already read and has renamed.
 * If it has, return the old file name for delete.
 * 
 * @param id node id
 * @param name node name 
 * @returns 
 */
export function checkIfRenamed(id: string, name: string) {
    if (files.has(id)) {
        const objs = files.get(id);
        const filesToDelete = objs.filter(o => o.nodeName !== name);
        if (filesToDelete && filesToDelete.length) {
            return filesToDelete.map(o => o.fileName);
        }
    }

    return undefined;
}

/**
 * Delete all old files
 * 
 * @param removeOptions 
 */
export async function removeRenamed(removeOptions: RemoveOptions) {
    const { baseDir, deleteFiles, newNodeName, newFileName, nodeId } = removeOptions;
    const dpromises = [];
    deleteFiles.forEach(names => dpromises.push(remove(resolve(baseDir, names))));
    try {
        await Promise.all(dpromises);
        files.set(nodeId, [{ nodeName: newNodeName, fileName: newFileName }]);
    } catch (error) {
        console.error('Error delete old flows/subflows files', error);
    }
}