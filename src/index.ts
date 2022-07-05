import { copyFileSync, existsSync, mkdirSync } from "fs";
import { copyFile, mkdir, readdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
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

function getArg(name) {
    const index = process.argv.indexOf(name);
    return process.argv[index + 1];
}

async function setup() {

    const source = getArg("--src");

    const name = getArg("--vars");

    const variablesDir = join(process.cwd(), "dv");
    const js = join(variablesDir, name);

    const variables = require(js);

    const appSettingsFile = join(source, "appsettings.json");

    const appSettings = await readFile(appSettingsFile, { encoding: "utf-8"});

    for (const key in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, key)) {
            const element = variables[key];
            console.log(`Replacing json ${key}`);
            update(appSettings, key, element);
        }
    }

    await writeFile(appSettingsFile, JSON.stringify(appSettings, undefined, 2), { encoding: "utf-8" });

}

setup()
    .then(() => console.log("done"))
    .catch((e) => {
        console.error(e.stack ? `${e.message}\r\n${e.stack}` : e);
        process.exitCode = -1;
    });
