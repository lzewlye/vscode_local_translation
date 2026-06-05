/**
 * en→zh translation processing.
 *
 * 处理英文输入的完整管线：
 * 1. 单词提取 — camelCase / 下划线拆分，支持多词短语（空格分隔）
 * 2. 词形还原 — 复数、过去式、现在分词等变形 → 根形式
 * 3. 释义优选 — 计算机领域 > 指定词性 > 任意首条；形容词+名词配对优化
 */
import * as types from './types';
import * as constants from './constants';

// ==================== Word Extraction ====================

/**
 * Extract English words from text.
 * Supports both programming identifiers (camelCase, snake_case) and
 * natural-language multi-word phrases (space-separated, e.g. "to reach").
 */
export function extractWords(text: string): string[] {
    const trimmed = text.trim();
    // 先按空白拆分以支持多词短语（如 CC-CEDICT 的 "to reach" 释义）
    const parts = trimmed.split(/\s+/);
    let result: string[] = [];
    for (const part of parts) {
        const words = part.match(/[a-zA-Z]+/g);
        if (words) {
            for (let w of words) {
                result = result.concat(splitCamel(w));
            }
        }
    }
    return result;
}

/** Split a camelCase token into individual words */
function splitCamel(name: string): string[] {
    return name.split(/([A-Z]+|[A-Z]?[a-z]+)(?=[A-Z]|\b)/).filter(w => w);
}

// ==================== Word Form Reduction ====================

/**
 * ECDICT 词形编码 → 可读标签的映射。
 * 编码来自 ECDICT forms 数据格式：
 *   p=过去式, d=过去分词, i=现在分词, 3=三单, r=比较级, t=最高级,
 *   s=复数, 0=根形式, 1=复合变形
 */
const FORM_TYPE_MAP: { [key: string]: string } = {
    "p": "past tense",
    "d": "past participle",
    "i": "present participle",
    "3": "third person singular",
    "r": "comparative",
    "t": "superlative",
    "s": "plural",
    "0": "root",
    "1": "combined forms"
};

/** Parse raw ECDICT forms string into structured WordForm array */
export function parseForms(raw: string): types.WordForm[] {
    let forms: types.WordForm[] = [];
    if (!raw) return forms;
    const fields = raw.split("/");
    for (let f of fields) {
        const parts = f.split(":");
        const type = FORM_TYPE_MAP[parts[0]];
        let combined: string[] = [];
        if (type === "combined forms") {
            for (let ch of parts[1]) {
                combined.push(FORM_TYPE_MAP[ch]);
            }
        }
        forms.push({
            type: type,
            change: parts.length === 1 ? "" : (type === "combined forms" ? combined : parts[1])
        });
    }
    return forms;
}

/**
 * Get root form of an English word.
 * 仅在复数或现在分词时还原为根形式（过去式等不做还原，避免含义偏差）。
 */
export function getRoot(word: string, forms: types.WordForm[]): string {
    if (!forms) return word;
    let root = word;
    let isPluralOrGerund = false;
    for (let f of forms) {
        const change = f.change;
        if (f.type === "combined forms" && Array.isArray(change) &&
            (change.includes("plural") || change.includes("present participle"))) {
            isPluralOrGerund = true;
        }
        if (f.type === "root") {
            root = change as string;
        }
    }
    return isPluralOrGerund ? root : word;
}

// ==================== Definition Selection ====================

/**
 * Group dictionary definitions by POS/domain tag.
 * Returns a Map: POS tag → array of meanings.
 */
export function groupByPOS(def: string): Map<string, string[]> {
    const lines = def.split('\\n');
    const map = new Map<string, string[]>();
    for (let i in lines) {
        let line = lines[i];
        let spacePos = line.indexOf(' ');
        let pos = spacePos > 0 ? line.substring(0, spacePos) : '';
        if (pos && constants.POS_TAGS.has(pos)) {
            line = line.substring(pos.length).trim();
        } else {
            pos = '';
        }
        const meanings = line.split(/[；;,]/);
        let posMeanings: string[] = [];
        for (let m of meanings) {
            posMeanings.push(m.trim());
        }
        map.set(pos, posMeanings);
    }
    return map;
}

/**
 * Pick the best definition from a raw ECDICT entry.
 * 优先级：计算机领域 [计] > 指定词性 > 任意首条。
 * 选中后去除括号注解和方括号标签。
 */
export function pick(def: string, preferredPOS: string): string {
    if (!def) return '';
    const byPOS = groupByPOS(def);
    let picked = "";
    if (byPOS.has(constants.POS_COMPUTER)) {
        picked = byPOS.get(constants.POS_COMPUTER)![0];
    } else if (byPOS.has(preferredPOS)) {
        picked = byPOS.get(preferredPOS)![0];
    } else {
        for (let [k, v] of byPOS) {
            picked = v[0];
            break;
        }
    }
    return stripBrackets(picked);
}

/**
 * Select definitions for each word in a multi-word entry.
 * 特殊处理：当两个词分别为形容词+名词时，按对应词性分别选择释义。
 */
export function selectDefs(entries: types.WordEntry[], words: string[]): string[] {
    let defs: string[] = [];
    // 形容词+名词配对：如 "BasicCalculator" → 基本的 计算器
    if (entries.length === 2) {
        let d1 = entries[0].definition;
        let d2 = entries[1].definition;
        if (d1 && groupByPOS(d1).has(constants.POS_ADJ) &&
            d2 && groupByPOS(d2).has(constants.POS_NOUN)) {
            defs.push(pick(d1, constants.POS_ADJ));
            defs.push(pick(d2, constants.POS_NOUN));
            return defs;
        }
    }
    for (let i = 0; i < entries.length; i++) {
        let e = entries[i];
        defs.push(e.definition ? pick(e.definition, constants.POS_COMPUTER) : words[i]);
    }
    return defs;
}

// ==================== Definition Cleanup ====================

/** Remove bracket annotations (parentheses, square brackets, fullwidth) */
function stripBrackets(def: string): string {
    let cleaned = stripPair(def, "（", "）");
    cleaned = stripParens(cleaned);
    cleaned = cleaned.replace(/ *\[[^)]*\] */g, "");
    return cleaned.trim();
}

export function stripParens(s: string): string {
    return s.replace(/ *\([^)]*\) */g, "");
}

function stripPair(s: string, open: string, close: string): string {
    let openPos = s.indexOf(open);
    let closePos = s.indexOf(close);
    if (openPos === -1 || closePos === -1) return s;
    return s.replace(s.substring(openPos, closePos + 1), "");
}
