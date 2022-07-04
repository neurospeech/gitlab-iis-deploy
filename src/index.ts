import { copyFileSync, existsSync } from "fs";
import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
import downloadVariables from "./downloadVariables";
declare var require;

function update(target, key: string, value) {
    const tokens = key.split(".");
    const last = tokens.pop();
    for (const iterator of tokens) {
        target = target[iterator];
    }
    target[last] = value;
}

async function deleteFiles(folder) {
    const items = await readdir(folder, { withFileTypes: true });
    const tasks = [];
    for (const iterator of items) {
        const path = join(folder, iterator.name);
        if (iterator.isDirectory()) {
            tasks.push(deleteFiles(path));
            continue;
        }
        tasks.push(unlink(path));
    }
    await Promise.all(tasks);
}

function getArg(name) {
    const index = process.argv.indexOf(name);
    return process.argv[index + 1];
}

async function setup(source, destination) {

    // copy files to destination...
    await deleteFiles(destination);

    await copyFiles(source, destination);

    const variables = await downloadVariables(getArg("--variables"));

    const appSettingsFile = join(destination, "appsettings.json");

    const appSettings = await readFile(appSettingsFile);

    for (const key in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, key)) {
            const element = variables[key];
            update(appSettings, key, element);
        }
    }

    await writeFile(appSettingsFile, JSON.stringify(appSettings, undefined, 2));
}

setup()
    .then(() => console.log("done"))
    .catch((e) => console.error(e));
