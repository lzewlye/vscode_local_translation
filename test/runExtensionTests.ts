import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

function resolveInstalledVSCode(): string {
    const configured = process.env.VSCODE_EXECUTABLE_PATH;
    if (configured && fs.existsSync(configured)) return configured;

    if (process.platform === 'win32') {
        const paths = childProcess.execFileSync('where.exe', ['code'], { encoding: 'utf8' })
            .split(/\r?\n/)
            .map(value => value.trim())
            .filter(Boolean);
        for (const commandPath of paths) {
            const candidate = path.resolve(path.dirname(commandPath), '..', 'Code.exe');
            if (fs.existsSync(candidate)) return candidate;
        }
    }

    throw new Error('未找到本机 VS Code。请通过 VSCODE_EXECUTABLE_PATH 指定可执行文件。');
}

async function main(): Promise<void> {
    const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
    const benchmark = process.argv.includes('--benchmark');
    const extensionTestsPath = path.resolve(
        __dirname,
        benchmark ? 'benchmark' : 'extension',
        'index'
    );

    await runTests({
        vscodeExecutablePath: resolveInstalledVSCode(),
        extensionDevelopmentPath,
        extensionTestsPath,
        launchArgs: ['--disable-extensions', '--skip-welcome', '--skip-release-notes'],
    });
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
