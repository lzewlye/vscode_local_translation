import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as yauzl from 'yauzl';
import { verifyVsixEntries } from './packageVerifier';

async function main(): Promise<void> {
    const projectRoot = path.resolve(__dirname, '..', '..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const artifactDirectory = path.join(projectRoot, '.artifacts');
    const vsixPath = path.join(artifactDirectory, `${packageJson.name}-${packageJson.version}.vsix`);
    fs.mkdirSync(artifactDirectory, { recursive: true });

    const vsceCli = require.resolve('@vscode/vsce/vsce');
    execFileSync(
        process.execPath,
        [vsceCli, 'package', '--no-dependencies', '--out', vsixPath],
        { cwd: projectRoot, stdio: 'inherit' }
    );

    const entries = await readZipEntries(vsixPath);
    const sizeBytes = fs.statSync(vsixPath).size;
    const verification = verifyVsixEntries(entries, sizeBytes);
    const report = {
        vsixPath,
        entryCount: entries.length,
        ...verification,
    };
    fs.writeFileSync(
        path.join(artifactDirectory, 'package-report.json'),
        JSON.stringify(report, null, 2) + '\n',
        'utf8'
    );
    console.log(JSON.stringify(report));
}

function readZipEntries(vsixPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        yauzl.open(vsixPath, { lazyEntries: true }, (error, zipFile) => {
            if (error) return reject(error);
            if (!zipFile) return reject(new Error(`Unable to open VSIX: ${vsixPath}`));

            const entries: string[] = [];
            zipFile.on('error', reject);
            zipFile.on('entry', entry => {
                entries.push(entry.fileName);
                zipFile.readEntry();
            });
            zipFile.on('end', () => resolve(entries));
            zipFile.readEntry();
        });
    });
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
