
import { Gitlab } from "@gitbeaker/node";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

export default async function downloadVariables(host: string, id: string, jobToken: string, name: string) {

    // const variablesDir = join(process.cwd(), "dv");
    // if (!existsSync(variablesDir)) {
    //     await mkdir(variablesDir);
    // }

    // console.log(`Connecting to git at ${host} with jobToken`);

    // const api = new Gitlab({
    //     host,
    //     jobToken
    // });

    // console.log(`Querying master branch files for repo ${id}`);

    // const tree = await api.Repositories.tree(id);
    // const files = [];
    // const tasks = [];
    // for (const iterator of tree) {
    //     const path = join(variablesDir, iterator.path);
    //     files.push(path);
    //     console.log(`Downloading file ${iterator.path} from ${id} to ${path}`);
    //     tasks.push(writeFile(path, await api.RepositoryFiles.showRaw(id, iterator.path)));
    // }
    // await Promise.all(tasks);

    const js = join("dv", name);

    const variables = require(js);

    // for (const iterator of files) {
    //     await unlink(iterator);
    // }

    return variables;
}
