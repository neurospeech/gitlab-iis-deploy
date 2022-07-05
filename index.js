"use strict";
const fs = require("fs");
const path = require("path");
function update(target, key, value) {
    const tokens = key.split(".");
    const last = tokens.pop();
    for (const iterator of tokens) {
        target = target[iterator];
        if (!target) {
            return;
        }
    }
    target[last] = value;
}
function getArg(name) {
    const index = process.argv.indexOf(name);
    return process.argv[index + 1];
}
function setup() {
    const source = getArg("--src");
    const name = getArg("--vars");
    const variablesDir = path.join(process.cwd(), "dv");
    const js = path.join(variablesDir, name);
    const variables = require(js);
    const appSettingsFile = path.join(source, "appsettings.json");
    const appSettings = JSON.parse(fs.readFileSync(appSettingsFile, { encoding: "utf-8" }));
    for (const key in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, key)) {
            const element = variables[key];
            console.log(`Replacing json ${key}`);
            update(appSettings, key, element);
        }
    }
    fs.writeFileSync(appSettingsFile, JSON.stringify(appSettings, undefined, 2), { encoding: "utf-8" });
}
setup();