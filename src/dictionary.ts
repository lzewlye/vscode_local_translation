/**
 * Bidirectional translation dispatcher.
 *
 * 根据输入文本的语言特征自动路由到对应翻译管线：
 * - 含中文字符 → zh→en (CC-CEDICT)
 * - 含英文字母 → en→zh (ECDICT)
 */
import * as seg from './translator/segmenter';
import * as enProcessor from './translator/enZhProcessor';
import * as custom from './translator/customDict';
import * as constants from './translator/constants';
import * as types from './translator/types';
import * as dict from './loader';

// ==================== Language Detection ====================

/**
 * Detect source language(s) in input text.
 * Returns 'mixed' when both CJK and Latin letters are present,
 * so each segment can be routed to the appropriate dictionary.
 */
function detectLang(text: string): 'zh' | 'en' | 'mixed' {
    const hasChinese = /[一-鿿]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    if (hasChinese && hasEnglish) return 'mixed';
    if (hasChinese) return 'zh';
    return 'en'; // numbers / symbols → default to en path
}

// ==================== Public Entry Point ====================

export function translate(text: string): types.Translation {
    if (!text || text.trim().length === 0) {
        return { original: text || '', definition: '', entries: [] };
    }
    const lang = detectLang(text);
    if (lang === 'mixed') return translateMixed(text);
    if (lang === 'zh') return zhToEn(text);
    return enToZh(text);
}

// ==================== Mixed Text Translation ====================

/**
 * 混合文本翻译：逐词检测语言后分别路由到对应词典。
 *
 * 处理流程：
 * 1. 用 segmenter.tokenize() 拆分中文/非中文片段
 * 2. 中文词 → zh→en 查找（自定义词典 > CC-CEDICT）
 * 3. 英文词 → en→zh 查找（自定义词典 > ECDICT，含大小写回退）
 * 4. 数字/符号 → 保留原样
 * 5. 拼接各词释义作为整体翻译结果
 *
 * Example: "使用Python编程" → "use Python 编程" (逐词)
 *          → entries: [{使用,use}, {Python,派森}, {编程,program}]
 */
function translateMixed(text: string): types.Translation {
    const words = seg.tokenize(text);
    if (words.length === 0) {
        return { original: text, definition: '', entries: [] };
    }

    const entries: types.WordEntry[] = [];

    for (const word of words) {
        if (/[一-鿿]/.test(word)) {
            entries.push(lookupZhWord(word));
        } else if (/[a-zA-Z]/.test(word)) {
            entries.push(lookupEnWord(word));
        } else {
            // 数字、符号等 → 保留原样
            entries.push({ word, definition: word });
        }
    }

    // 构建整体翻译：逐词拼接（只取分号前第一个义项）
    const definition = entries
        .map(e => {
            if (!e.definition) return `[${e.word}]`;
            return firstMeaning(e.definition);
        })
        .join(' ');

    return { original: text, definition, entries };
}

/** 中文单词 → 英文释义（自定义词典 > CC-CEDICT） */
function lookupZhWord(word: string): types.WordEntry {
    if (custom.zhEnNames[word]) {
        return { word, definition: custom.zhEnNames[word] };
    }
    if (dict.zhEnReady && dict.zhEnDict[word]) {
        return { word, definition: dict.zhEnDict[word] };
    }
    return { word, definition: '' };
}

/** 英文单词 → 中文释义（大小写回退 > 自定义词典 > ECDICT > 词性优选） */
function lookupEnWord(word: string): types.WordEntry {
    // 大小写回退：保留原大写优先，否则尝试小写查找
    let lookup = word;
    if (lookup !== word.toUpperCase()) {
        if (dict.enZhDict[lookup] === undefined) {
            lookup = word.toLowerCase();
        }
    } else {
        if (!dict.enZhDict[lookup]) {
            lookup = word.toLowerCase();
        }
    }

    // 跳过词：保留原文不翻译
    if (lookup in custom.enZhSkipWords) {
        return { word, definition: word };
    }

    // 自定义编程术语词典
    if (custom.enZhNames[lookup]) {
        return { word, definition: custom.enZhNames[lookup] };
    }

    // ECDICT 主词典 + 词性优选（计算机领域优先）
    if (dict.enZhReady && dict.enZhDict[lookup]) {
        const def = enProcessor.pick(dict.enZhDict[lookup], constants.POS_COMPUTER);
        return { word, definition: def };
    }

    // 未命中：保留原文
    return { word, definition: word };
}

/**
 * 从释义中提取第一条义项（分号或逗号前的部分）。
 * CC-CEDICT 每条释义常包含多个近义表达，拼接时只取第一个避免冗余。
 */
function firstMeaning(def: string): string {
    const firstLine = def.includes('\\n')
        ? def.split('\\n')[0]
        : def;
    // 取分号/逗号前第一条义项
    let result = firstLine.split(/[;,]/)[0].trim();
    // 去除括号注解: (computing), （计算机）等
    result = result.replace(/\([^)]*\)/g, '').trim();
    result = result.replace(/（[^）]*）/g, '').trim();
    return result;
}

// ==================== zh→en (CC-CEDICT) ====================

/**
 * 汉→英翻译管线：
 * 1. 中文分词 (Trie + 双向最大匹配)
 * 2. 逐词查找：自定义词典 > CC-CEDICT > 空
 * 3. 合并结果：短语匹配优先，否则拼接各词首条释义
 */
function zhToEn(text: string): types.Translation {
    if (!dict.zhEnReady) {
        return { original: text, definition: '', entries: [] };
    }

    const words = seg.tokenize(text);
    if (words.length === 0) {
        return { original: text, definition: '', entries: [] };
    }

    const phraseDef = custom.zhEnPhrases[text.trim()];
    const entries: types.WordEntry[] = [];

    for (let word of words) {
        // 1. 自定义编程术语词典（最高优先级）
        if (custom.zhEnNames[word]) {
            entries.push({ word, definition: custom.zhEnNames[word] });
            continue;
        }
        // 2. CC-CEDICT 主词典
        let def = dict.zhEnDict[word];
        if (def) {
            entries.push({ word, definition: def });
            continue;
        }
        // 3. 未命中：中文保留空释义，非中文原样返回
        if (/[一-鿿]/.test(word)) {
            entries.push({ word, definition: '' });
        } else {
            entries.push({ word, definition: word });
        }
    }

    let definition: string;
    if (entries.length === 1) {
        definition = entries[0].definition || `Not found: ${entries[0].word}`;
    } else {
        if (phraseDef) {
            // 短语整体匹配（如 "获取用户名称" → "getUserName"）
            definition = phraseDef;
        } else {
            // 拼接各词的首条释义（只取分号前第一个义项，避免多义项拼接过长）
            definition = entries
                .map(e => {
                    if (!e.definition) return `[${e.word}]`;
                    return firstMeaning(e.definition);
                })
                .join(' ');
        }
    }

    return { original: text, definition, entries };
}

// ==================== en→zh (ECDICT) ====================

/**
 * 英→汉翻译管线：
 * 1. 单词提取 (camelCase/下划线/空格拆分)
 * 2. 大小写处理 + 跳过词过滤
 * 3. 词形还原 (仅复数/现在分词)
 * 4. 词性优选 (计算机 > 指定词性 > 任意首条)
 * 5. 整体翻译拼接 (短语匹配 / 逐词组合 / ellipsis 替换)
 */
function enToZh(text: string): types.Translation {
    if (!dict.enZhReady) {
        return { original: text, definition: '', entries: [] };
    }

    const words = enProcessor.extractWords(text);
    if (words.length === 0) {
        return { original: text, definition: '', entries: [] };
    }

    const entries: types.WordEntry[] = [];

    for (let word of words) {
        let processed = word;

        // 大小写回退：保留原大写优先，否则尝试小写查找
        if (processed !== word.toUpperCase()) {
            if (dict.enZhDict[processed] === undefined) {
                processed = word.toLowerCase();
            }
        } else {
            if (!dict.enZhDict[processed]) {
                processed = word.toLowerCase();
            }
        }

        // 跳过词：保留原文不翻译
        if (processed in custom.enZhSkipWords) {
            entries.push({ word: processed, definition: processed });
            continue;
        }

        // 多词场景：尝试词形还原（仅复数/现在分词）
        let forms: types.WordForm[] = [];
        if (words.length > 1) {
            const rawForms = enProcessor.parseForms(dict.enZhForms[processed]);
            processed = enProcessor.getRoot(processed, rawForms);
        }
        forms = enProcessor.parseForms(dict.enZhForms[processed]);

        entries.push({
            word: processed,
            definition: dict.enZhDict[processed],
            forms,
        });
    }

    // 构建整体翻译
    let definition = text;
    if (entries.length > 1) {
        const phraseDef = lookupPhrase(entries);
        if (phraseDef) {
            definition = phraseDef;
        } else {
            definition = translateWords(text, entries, words);
        }
    } else if (entries.length === 1) {
        definition = entries[0].definition;
    }

    return { original: text, definition, entries };
}

// ==================== en→zh Helpers ====================

/** 尝试匹配自定义短语或计算机领域释义 */
function lookupPhrase(entries: types.WordEntry[]): string {
    const words = entries.map(e => e.word);
    const phrase = words.join(' ');
    return custom.enZhPhrases[phrase]
        || enProcessor.pick(dict.enZhDict[phrase], constants.POS_COMPUTER);
}

/**
 * 组合多词翻译结果，还原原文中的非英文部分（符号、数字等）。
 * 支持 ellipsis "..." 占位符替换（如 "before..." → "在...之前"）。
 */
function translateWords(
    text: string, entries: types.WordEntry[], words: string[]
): string {
    let result = text;
    const preferredDefs = enProcessor.selectDefs(entries, words);
    const parts: string[] = [];

    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let pos = result.indexOf(word);
        if (pos > 0) {
            parts.push(result.substring(0, pos));
        }
        parts.push(custom.enZhNames[entries[i].word] || preferredDefs[i]);
        result = result.substring(pos + word.length);
    }
    if (result !== '') {
        parts.push(result);
    }
    // 处理 "..." 省略号占位符（如 before... → 在...之前）
    if (parts.length > 1 && parts[0].indexOf('...') > 0) {
        result = parts[0].replace('...', parts.splice(1).join(''));
    } else {
        result = parts.join('');
    }
    return result;
}
