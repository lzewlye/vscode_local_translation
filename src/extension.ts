/**
 * Entry point for the "中文本地翻译 (localTranslation)" VS Code extension.
 *
 * 提供五个交互入口：
 * 1. 快速翻译变量名 — Ctrl+Shift+T 选中中文，一键替换为英文驼峰/下划线变量名
 * 2. 状态栏翻译 — 选中文本后自动显示简要翻译
 * 3. QuickPick 面板 — 命令面板运行，支持逐词详查和反向复查
 * 4. Hover 悬停 — 鼠标悬停单词显示翻译（需配置开启）
 * 5. 批量翻译标识符 — 命令面板运行，翻译整个文件的标识符
 *
 * QuickPick 三级导航流程：
 *   Overview (zh→en 逐词) → Detail (展开单词释义)
 *       → Reverse (点击英文释义 → en→zh 反向查中文，人工验证翻译质量)
 */
import { workspace, languages, window, commands, ExtensionContext, Disposable, StatusBarAlignment, TextDocument, Position, Hover } from 'vscode';
import FileTranslator, { encodeLocation } from './fileTranslator';
import * as types from './translator/types';
import * as dict from './dictionary';
import * as loader from './loader';
import * as utils from './utils';

function activate(context: ExtensionContext) {

    const translator = new FileTranslator();

    const providerReg = Disposable.from(
        workspace.registerTextDocumentContentProvider(FileTranslator.scheme, translator)
    );

    // ==================== 快速翻译中文变量名 ====================
    const NAMING_STYLE_CONFIG = 'localTranslation.variableNamingStyle';

    const varCmd = commands.registerTextEditorCommand(
        'localTranslation.翻译中文变量名',
        editor => {
            const text = editor.document.getText(editor.selection).trim();
            if (!text) {
                window.showWarningMessage('请先选中要翻译的中文文本。');
                return;
            }
            // 仅对包含中文的文本做变量名翻译，纯英文不处理
            if (!/[一-鿿]/.test(text)) {
                window.showInformationMessage('快速翻译中文变量名仅对含中文的文本生效。');
                return;
            }
            const result = dict.translate(text);
            if (!result.entries.length) {
                window.showInformationMessage('未找到翻译结果。');
                return;
            }
            // 提取各词的首条纯净英文释义，拆分多词结果并过滤虚词
            const STOP_WORDS = new Set([
                'to', 'a', 'an', 'the',
                'of', 'in', 'on', 'at', 'for', 'with', 'by',
                'is', 'are', 'was', 'were', 'be', 'been', 'being',
                'and', 'or', 'not', 'no',
                // CC-CEDICT 中常作为冗余修饰词
                'language',
            ]);
            const words: string[] = [];
            for (const entry of result.entries) {
                const def = entry.definition;
                if (!def) {
                    // 未命中：英文字母直接保留
                    if (/[a-zA-Z]/.test(entry.word)) {
                        words.push(entry.word.toLowerCase());
                    }
                    continue;
                }
                const clean = dict.firstMeaning(def);
                if (!clean) continue;
                // 拆分空格分隔的多词释义，过滤虚词后全部保留
                // （如 "data structure" → ["data", "structure"] → dataStructure）
                for (const token of clean.split(/\s+/)) {
                    const lower = token.toLowerCase();
                    if (token && !STOP_WORDS.has(lower)) {
                        words.push(token);
                    }
                }
            }
            if (words.length === 0) {
                window.showInformationMessage('无法提取英文标识符。');
                return;
            }
            const style = workspace.getConfiguration('localTranslation').get<string>(NAMING_STYLE_CONFIG) || 'camelCase';
            const varName = utils.formatVariableName(words, style);

            editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, varName);
            }).then(success => {
                if (result.truncated) {
                    window.showWarningMessage(
                        `输入过长，仅翻译前 ${result.entries.length} 个词。可在设置中修改 localTranslation.maxWords。`
                    );
                }
            });
        }
    );

    // 批量翻译标识符命令
    const batchCmd = commands.registerTextEditorCommand(
        'localTranslation.批量翻译标识符',
        editor => {
            const uri = encodeLocation(editor.document.uri, editor.selection.active);
            return workspace.openTextDocument(uri).then(
                doc => window.showTextDocument(doc, editor.viewColumn !== undefined ? editor.viewColumn + 1 : undefined)
            );
        }
    );

    // 状态栏（右侧，显示简要翻译结果）
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);
    statusBar.command = 'localTranslation.翻译选中文本';
    context.subscriptions.push(translator, varCmd, batchCmd, providerReg, statusBar);

    // 监听编辑器事件以实时更新状态栏
    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(() => updateStatusBar(statusBar))
    );
    context.subscriptions.push(
        window.onDidChangeTextEditorSelection(() => updateStatusBar(statusBar))
    );
    context.subscriptions.push(
        window.onDidChangeTextEditorViewColumn(() => updateStatusBar(statusBar))
    );
    context.subscriptions.push(
        workspace.onDidOpenTextDocument(() => updateStatusBar(statusBar))
    );
    context.subscriptions.push(
        workspace.onDidCloseTextDocument(() => updateStatusBar(statusBar))
    );

    // ==================== QuickPick 交互面板 ====================
    // 同一时间只允许一个 QuickPick 可见
    let currentPicker: any = null;

    context.subscriptions.push(commands.registerCommand(
        'localTranslation.翻译选中文本',
        () => {
            const text = getSelectedText() || '';  // allow empty for free-form input

            if (currentPicker) {
                currentPicker.dispose();
                currentPicker = null;
            }

            const picker = window.createQuickPick();
            currentPicker = picker;
            picker.placeholder = text || 'Type Chinese or English to translate…';

            // 导航状态：overview → detail → reverse（三级）
            let currentMode: 'overview' | 'detail' | 'reverse' = 'overview';
            let currentQuery = '';
            let currentDetailEntry: types.WordEntry | null = null;

            // -------- Overview: 选中文本的逐词翻译结果 --------
            const showOverview = (input: string) => {
                currentMode = 'overview';
                currentQuery = input.trim();
                if (!currentQuery) {
                    picker.items = [{ label: 'Enter Chinese or English to translate', description: '', alwaysShow: true }];
                    return;
                }
                const result = lookupTerm(currentQuery);
                if (!result.entries.length) {
                    picker.items = [{ label: 'No results', description: '', alwaysShow: true }];
                    return;
                }
                const items: any[] = [];
                for (const entry of result.entries) {
                    const def = entry.definition ? formatDef(entry.definition) : 'Not found';
                    items.push({
                        label: entry.word,
                        description: def,
                        alwaysShow: true,
                        _entry: entry,
                    });
                }
                // 多词时追加合并翻译行
                if (result.entries.length > 1) {
                    items.push({
                        label: '— 合并翻译 —',
                        description: formatDef(result.definition),
                        alwaysShow: true,
                        _entry: { word: result.original, definition: result.definition },
                    });
                }
                // 截断提示
                if (result.truncated) {
                    items.push({
                        label: `⚠ 仅显示前 ${result.entries.length} 个翻译结果（共 ${(result.skippedCount || 0) + result.entries.length} 个词）`,
                        description: '可修改 localTranslation.maxWords 调整上限',
                        alwaysShow: true,
                    });
                }
                picker.items = items;
            };

            // -------- Detail: 展开某个单词的全部英文释义 --------
            const showDetail = (entry: types.WordEntry) => {
                currentMode = 'detail';
                currentDetailEntry = entry;
                const items: any[] = [
                    { label: '$(arrow-left) Back', description: '', alwaysShow: true },
                ];
                if (entry.definition) {
                    const defs = entry.definition.split('\\n');
                    for (let i = 0; i < defs.length; i++) {
                        // 每条释义可点击进入反向复查
                        items.push({
                            label: `${i + 1}. ${defs[i]}`,
                            description: '↩ reverse check',
                            alwaysShow: true,
                            _reverseQuery: defs[i],
                        });
                    }
                } else {
                    items.push({ label: 'Not found', description: '', alwaysShow: true });
                }
                picker.items = items;
            };

            // -------- Reverse: 英文释义 → en→zh 反向复查中文 --------
            const showReverseLookup = (query: string) => {
                currentMode = 'reverse';
                const result = lookupTerm(query.trim());
                const items: any[] = [
                    { label: `$(arrow-left) Back to "${currentDetailEntry?.word || ''}"`, description: '', alwaysShow: true },
                ];
                if (result.entries.length > 0) {
                    for (const entry of result.entries) {
                        items.push({
                            label: entry.word,
                            description: entry.definition ? formatDef(entry.definition) : 'Not found',
                            alwaysShow: true,
                        });
                    }
                } else {
                    items.push({ label: 'No results', description: '', alwaysShow: true });
                }
                picker.items = items;
            };

            // 初始展示：翻译当前选中文本
            showOverview(text);

            // 用户输入变化 → 实时搜索（回到 overview 模式）
            picker.onDidChangeValue(input => showOverview(input));

            // 点击条目时的三级导航分发
            picker.onDidAccept(() => {
                const selected: any = picker.selectedItems[0];
                if (!selected) return;
                if (currentMode === 'overview' && selected._entry) {
                    // Overview → 展开单词的英文释义详查
                    showDetail(selected._entry);
                } else if (currentMode === 'detail') {
                    if (selected.label.includes('Back')) {
                        // Detail → 返回 Overview
                        showOverview(currentQuery);
                    } else if (selected._reverseQuery) {
                        // Detail → 英文释义反向查中文，验证翻译质量
                        showReverseLookup(selected._reverseQuery);
                    }
                } else if (currentMode === 'reverse') {
                    if (selected.label.includes('Back') && currentDetailEntry) {
                        // Reverse → 返回 Detail（不是 Overview）
                        showDetail(currentDetailEntry);
                    }
                }
            });

            picker.onDidHide(() => {
                currentPicker = null;
                picker.dispose();
            });
            picker.show();
        }
    ));

    updateStatusBar(statusBar);

    // ==================== Hover Provider ====================

    const HOVER_CONFIG = 'localTranslation.enableHover';
    let hoverEnabled = workspace.getConfiguration().get(HOVER_CONFIG);
    context.subscriptions.push(workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(HOVER_CONFIG)) {
            hoverEnabled = workspace.getConfiguration().get(HOVER_CONFIG);
        }
    }));

    context.subscriptions.push(languages.registerHoverProvider(
        { pattern: '**' },
        {
            provideHover: (document: TextDocument, position: Position) => {
                if (!hoverEnabled) return;
                // 中英文分开匹配，避免混合文本被当成一个整体"词"
                const range = document.getWordRangeAtPosition(position, /[一-鿿]+|[a-zA-Z]+/);
                if (!range) return;
                const text = document.getText(range).trim();
                if (!text) return;
                const result = getDetailInfo(lookupTerm(text));
                return new Hover(result);
            }
        }
    ));
}

// ==================== Status Bar ====================

/** 更新状态栏：加载中显示 spinner，就绪后显示选中文本翻译 */
function updateStatusBar(bar: any) {
    if (!loader.zhEnReady) {
        bar.text = '$(sync~spin) Loading dictionaries…';
        bar.show();
        loader.zhEnPromise.then(() => updateStatusBar(bar));
        return;
    }

    const text = getSelectedText();
    if (text) {
        bar.text = '$(megaphone) ' + truncate(getBriefInfo(lookupTerm(text)), 40);
        bar.show();
    } else {
        bar.hide();
    }
}

function getSelectedText(): string {
    const editor = window.activeTextEditor;
    if (!editor) return '';
    const text = editor.document.getText(editor.selection);
    return text && text.trim().length > 0 ? text.trim() : '';
}

function lookupTerm(text: string): types.Translation {
    return dict.translate(text);
}

// ==================== Display Helpers ====================

/** Replace literal \\n with "; " for single-line display (status bar, QuickPick description) */
function formatDef(def: string): string {
    if (!def) return '';
    return def.split('\\n').join('; ');
}

/** Format definition for detail display (hover tooltip): break before each POS/domain tag for readability */
function formatDetailDef(def: string): string {
    if (!def) return '';
    return def
        .split('\\n')
        .join('; ')
        .replace(/【/g, '  \n【')      // soft break before 【化学】, 【计算机】 etc.
        .replace(/^  \n/, '');
}

/** Truncate long text with ellipsis */
function truncate(text: string, maxLen: number): string {
    return text.length > maxLen ? text.substring(0, maxLen - 1) + '…' : text;
}

/** Brief single-line info for the status bar */
function getBriefInfo(result: types.Translation): string {
    let brief: string;
    if (!result.definition) {
        brief = 'Not found: ' + result.original;
    } else if (result.entries.length === 1) {
        const first = result.entries[0].definition.split('\\n')[0];
        brief = first || 'Not found';
    } else {
        brief = result.entries
            .map(e => e.definition ? e.definition.split('\\n')[0] : '[' + e.word + ']')
            .join(' ');
    }
    if (result.truncated) {
        brief += ` (前${result.entries.length}词)`;
    }
    return brief;
}

/** Detailed info for hover / info message */
function getDetailInfo(result: types.Translation): string {
    if (result.entries.length === 1) {
        return formatEntry(result.entries[0], true);
    }
    const lines: string[] = [];
    for (const entry of result.entries) {
        lines.push(`**${entry.word}**  \n${formatDetailDef(entry.definition || 'Not found')}`);
    }
    // 多词时追加合并翻译（用 Unicode 分隔线，VS Code hover 不支持 Markdown ---）
    if (result.entries.length > 1 && result.definition) {
        lines.push('─────  \n' + formatDetailDef(result.definition));
    }
    return lines.join('\n\n');
}

function formatEntry(entry: types.WordEntry, showWord: boolean = false): string {
    let text = showWord ? '**' + entry.word + '**  \n' : '';
    if (entry.definition) {
        text += formatDetailDef(entry.definition);
    } else {
        text += ' Not found';
    }
    return text;
}

exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;
