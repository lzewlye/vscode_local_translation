import * as assert from 'assert';
import * as vscode from 'vscode';
import * as loader from '../../src/loader';

suite('extension commands', () => {
    suiteSetup(async () => {
        await loader.zhEnPromise;
        await vscode.extensions.getExtension('lzewlye.local-translation')?.activate();
    });

    for (const [style, expected] of [
        ['camelCase', 'userName'],
        ['PascalCase', 'UserName'],
        ['snake_case', 'user_name'],
    ] as const) {
        test(`applies the configured ${style} variable naming style`, async () => {
            const configuration = vscode.workspace.getConfiguration('localTranslation');
            await configuration.update('variableNamingStyle', style, vscode.ConfigurationTarget.Global);

            const document = await vscode.workspace.openTextDocument({ content: '用户名称' });
            const editor = await vscode.window.showTextDocument(document);
            editor.selection = new vscode.Selection(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            await vscode.commands.executeCommand('localTranslation.翻译中文变量名');
            await waitForText(document, expected);
            assert.equal(document.getText(), expected);
        });
    }
});

async function waitForText(document: vscode.TextDocument, expected: string): Promise<void> {
    const deadline = Date.now() + 2_000;
    while (document.getText() !== expected && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 20));
    }
}
