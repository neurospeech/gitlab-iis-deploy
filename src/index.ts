import { copyFileSync, existsSync, mkdirSync } from "fs";
import { copyFile, mkdir, readdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
import downloadVariables from "./downloadVariables";
declare var require;

/**
 * https://stackoverflow.com/questions/2710166/how-can-i-stop-and-start-individual-websites-in-iis-using-powershell
 * @param target 
 * @param key 
 * @param value 
 */

function update(target, key: string, value) {
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

async function copyFiles(source, destination) {
    if (!existsSync(destination)) {
        mkdirSync(destination);
    }
    const items = await readdir(source, { withFileTypes: true });
    const tasks = [];
    for (const iterator of items) {
        const path = join(source, iterator.name);
        const dest = join(destination, iterator.name);
        if (iterator.isDirectory()) {
            tasks.push(copyFiles(path, dest));
            continue;
        }
        console.log(`Copying ${path} to ${dest}`);
        tasks.push(copyFile(path, dest));
    }
    await Promise.all(tasks);
}

function getArg(name) {
    const index = process.argv.indexOf(name);
    return process.argv[index + 1];
}

async function setup() {

    const source = getArg("--src");
    const destination = getArg("--dest");
    const variablesRpoHost = getArg("--vars-host") || process.env.CI_SERVER_HOST;
    const variablesRepo = getArg("--vars-repo");
    const varsToken = process.env.CI_JOB_TOKEN;

    // copy files to destination...
    // await deleteFiles(destination);

    await copyFiles(source, destination);

    const variables = await downloadVariables(variablesRpoHost, variablesRepo, varsToken, getArg("--vars"));

    const appSettingsFile = join(destination, "appsettings.json");

    const appSettings = await readFile(appSettingsFile);

    for (const key in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, key)) {
            const element = variables[key];
            console.log(`Replacing json ${key}`);
            update(appSettings, key, element);
        }
    }

    await writeFile(appSettingsFile, JSON.stringify(appSettings, undefined, 2));
}

setup()
    .then(() => console.log("done"))
    .catch((e) => {
        console.error(e.stack ? `${e.message}\r\n${e.stack}` : e);
        process.exitCode = -1;
    });
