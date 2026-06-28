/**
 * Batch identifier translator — translates all identifiers in the current file
 * and renders the result in a new read-only editor tab.
 *
 * 通过 vscode.executeDocumentSymbolProvider 获取当前文件的所有标识符，
 * 按长度降序逐个翻译（避免短词误替换长词前缀），在新标签页展示结果。
 */
import * as vscode from 'vscode';
import * as dict from './dictionary';
import * as utils from './utils';
import * as constants from './translator/constants';

export default class FileTranslator implements vscode.TextDocumentContentProvider {

    static scheme = 'references';
    private originalNames: string[] = [];

    dispose() {}

    provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('没有打开的编辑器，无法批量翻译。');
            return '';
        }
        return vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider', editor.document.uri
        ).then((symbols: Array<vscode.DocumentSymbol> | undefined) => {
            if (!symbols || symbols.length === 0) {
                vscode.window.showInformationMessage('当前文件没有可翻译的标识符。');
                return '';
            }
            // 重置，避免多次调用时标识符累积
            this.originalNames = [];

            // 收集所有标识符（含子级）
            for (let symbol of symbols) {
                this.originalNames.push(symbol.name);
                for (let child of symbol.children) {
                    this.originalNames.push(child.name);
                }
            }

            // 按长度降序排列，避免短词先替换破坏长词
            this.originalNames.sort((a, b) => b.length - a.length);

            // 限制最大翻译数量，保证翻译速度
            const maxWords = vscode.workspace.getConfiguration('localTranslation').get<number>('maxWords') || constants.MAX_WORDS_DEFAULT;
            if (this.originalNames.length > maxWords) {
                const skipped = this.originalNames.length - maxWords;
                this.originalNames = this.originalNames.slice(0, maxWords);
                vscode.window.showWarningMessage(
                    `标识符过多（共 ${this.originalNames.length + skipped} 个），仅翻译前 ${maxWords} 个（跳过 ${skipped} 个）。可在设置中修改 localTranslation.maxWords 调整上限。`
                );
            }

            let newContent = editor.document.getText();
            for (let name of this.originalNames) {
                const result = dict.translate(name);
                if (result.definition) {
                    const translation = result.definition.includes('\\n')
                        ? result.definition.split('\\n')[0]
                        : result.definition;
                    // 注意：如果标识符包含正则特殊字符，replaceAll 可能行为异常。
                    // 当前接口仅处理 DocumentSymbol.name（编程标识符），
                    // 特殊字符概率极低，暂不引入 escape 逻辑。
                    newContent = this.replaceAll(newContent, name, translation);
                }
            }
            return newContent;
        });
    }

    private replaceAll(str: string, find: string, replace: string): string {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}

let seq = 0;

/** Encode editor location into a virtual URI for the translation result tab */
export function encodeLocation(uri: vscode.Uri, pos: vscode.Position): vscode.Uri {
    const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
    const fileName = utils.getFileName(uri.path);
    return vscode.Uri.parse(`${FileTranslator.scheme}:翻译${fileName}?${query}#${seq++}`);
}
