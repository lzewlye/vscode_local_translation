import * as assert from 'assert';
import * as vscode from 'vscode';

suite('extension test harness', () => {
    test('runs inside the installed VS Code extension host', () => {
        assert.ok(vscode.version.startsWith('1.141.'), `Unexpected VS Code: ${vscode.version}`);
    });
});
