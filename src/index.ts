import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
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

async function setup() {
    const variables = await downloadVariables(process.env.CI_JSON_VARIABLES_NAME);

    const appSettingsFile = join(process.cwd() + "appsettings.json");

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
