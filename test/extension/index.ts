import * as fs from 'fs';
import * as path from 'path';
import Mocha from 'mocha';

function collectTests(root: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        const fullPath = path.join(root, entry.name);
        if (entry.isDirectory()) files.push(...collectTests(fullPath));
        if (entry.isFile() && entry.name.endsWith('.test.js')) files.push(fullPath);
    }
    return files.sort();
}

export async function run(): Promise<void> {
    const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 60_000 });
    for (const file of collectTests(__dirname)) mocha.addFile(file);

    await new Promise<void>((resolve, reject) => {
        mocha.run(failures => failures === 0
            ? resolve()
            : reject(new Error(`${failures} extension test(s) failed.`)));
    });
}
