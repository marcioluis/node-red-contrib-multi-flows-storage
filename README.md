# node-red-contrib-multi-flows-storage

A Node-RED storage plugin that organize flows and subflows in folders as YAML or JSON for readability

## The problem

Node-RED stores flow files as JSON documents.
While JSON is lightweight and universal, it is not the most human readable format.
Node-RED stores various forms of code in function, comment and template nodes such as JavaScript, HTML, CSS, Markdown, etc.
These code blocks are reprensented as a single line in a JSON structure which makes it hard to debug when reading the flow file and it makes diffs very difficult to read.

## The solution

This storage module reads and saves flows and subflows as YAML or JSON files and organize they in multiple directories.
The main advantage is readability and less merge conflicts since every tab/subflow is saved as individual file.
Also, if you use the same Node-RED configuration/repository for a parametrized `flowFile` path in Node-RED settings this module organize each one in its own directory structure.

## Installation

```
npm install node-red-contrib-multi-flows-storage
```

You will also need to modify your `settings.js` file and add the following:

```javascript
storageModule: require("node-red-contrib-multi-flows-storage");
```

## JSON or YAML

By default all the flows are saved in `.yaml` to change this behavior is possible to create a options file in yours **Node-RED user dir**.

- Create a file named: _multiflows-options.json_ 

```json
{
  "fileFormat": "json" | "yaml"
}
```

## Example Directory Structure

Here is a comparation of directories structure.

Imagine you have a multi instance Node-RED that might use a different flow file parametrized on Node environment.

* Instance 1: flows-app.json
* Instance 2: flows-app2.json

```js
export default {
    flowFile: process.env.NODERED_FLOW_FILE || 'flows-app.json'
}
```
Default repository structure:

```
--src
    --nodered
    flows-app.json
    flows-app2.json
```

Your new repository structure will be like this.

```
--src
    --nodered
        --flows-app
            --flows
                <<tab name>>.yaml    
                my tab name.yaml
            --subflows
                <<subflow name>>.yaml
                my other subflow.yaml
            config-nodes.yaml
        --flows-app2
            --flows
                <<tab name>>.yaml    
                my tab name.yaml
            --subflows
                <<subflow name>>.yaml
                my other subflow.yaml
            config-nodes.yaml
```
