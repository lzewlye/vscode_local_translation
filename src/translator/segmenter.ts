/**
 * Chinese text segmentation using Trie + Bidirectional Maximum Matching.
 *
 * 使用 Trie 树存储词典，通过正向最大匹配和逆向最大匹配两种策略
 * 分别分词，再按"词数少优先、单字少优先"的启发式规则选择最优结果。
 *
 * Public API:
 * - initSegmenter(dictKeys): build the Trie from dictionary keys
 * - isReady(): whether the segmenter is initialized
 * - tokenize(text): segment input text (Chinese → words, non-Chinese kept as-is)
 */

// ==================== Trie ====================

class TrieNode {
    children: Map<string, TrieNode> = new Map();
    isEnd: boolean = false;
}

class Segmenter {
    private root = new TrieNode();
    private maxLen = 0;

    /** Insert a word into the Trie */
    insert(word: string): void {
        let node = this.root;
        for (const ch of word) {
            if (!node.children.has(ch)) {
                node.children.set(ch, new TrieNode());
            }
            node = node.children.get(ch)!;
        }
        node.isEnd = true;
        this.maxLen = Math.max(this.maxLen, word.length);
    }

    /**
     * Forward maximum matching — greedy longest match from left to right.
     * 从左到右扫描，每步在 Trie 中匹配尽可能长的词。
     */
    private forwardMatch(text: string): string[] {
        const result: string[] = [];
        let i = 0;
        while (i < text.length) {
            let bestMatch = text[i];
            let node = this.root;
            let lastMatchPos = -1;

            for (let j = i; j < text.length; j++) {
                const ch = text[j];
                if (!node.children.has(ch)) break;
                node = node.children.get(ch)!;
                if (node.isEnd) {
                    bestMatch = text.substring(i, j + 1);
                    lastMatchPos = j;
                }
            }

            result.push(bestMatch);
            i = lastMatchPos > i ? lastMatchPos + 1 : i + 1;
        }
        return result;
    }

    /**
     * Backward maximum matching — greedy longest match from right to left.
     * 从右到左扫描，每步匹配尽可能长的词。
     * 对于中文分词，逆向匹配通常略优于正向匹配。
     */
    private backwardMatch(text: string): string[] {
        const result: string[] = [];
        let i = text.length - 1;
        while (i >= 0) {
            let bestMatch = text[i];
            let lastMatchPos = -1;

            for (let j = i; j >= 0; j--) {
                let node = this.root;
                let fullMatch = true;
                for (let k = j; k <= i; k++) {
                    const ch = text[k];
                    if (!node.children.has(ch)) {
                        fullMatch = false;
                        break;
                    }
                    node = node.children.get(ch)!;
                }
                if (fullMatch && node.isEnd) {
                    bestMatch = text.substring(j, i + 1);
                    lastMatchPos = j;
                }
            }

            result.unshift(bestMatch);
            i = lastMatchPos < i && lastMatchPos !== -1 ? lastMatchPos - 1 : i - 1;
        }
        return result;
    }

    /**
     * Select the better segmentation between forward and backward results.
     * 启发式选择：词数少者优先；词数相同时，单字词少者优先。
     */
    private selectBest(fwd: string[], bwd: string[]): string[] {
        if (fwd.length !== bwd.length) {
            return fwd.length < bwd.length ? fwd : bwd;
        }
        const fwdSingles = fwd.filter(w => w.length === 1).length;
        const bwdSingles = bwd.filter(w => w.length === 1).length;
        if (fwdSingles !== bwdSingles) {
            return fwdSingles < bwdSingles ? fwd : bwd;
        }
        return fwd;
    }

    /** Run bidirectional maximum matching on a pure Chinese string */
    segment(text: string): string[] {
        if (!text || text.length === 0) return [];
        const fwd = this.forwardMatch(text);
        const bwd = this.backwardMatch(text);
        return this.selectBest(fwd, bwd);
    }

    getMaxLen(): number { return this.maxLen; }
}

// ==================== Global Segmenter ====================

let segmenter: Segmenter | null = null;

/**
 * Build the segmentation Trie from dictionary keys.
 * Must be called after CC-CEDICT shards finish loading.
 */
export function initSegmenter(dictKeys: string[]): void {
    segmenter = new Segmenter();
    for (const word of dictKeys) {
        segmenter.insert(word);
    }
}

export function isReady(): boolean {
    return segmenter !== null;
}

// ==================== Public API ====================

/** CJK Unified Ideographs (basic block + extension A) */
const CHINESE_RE = /[一-鿿㐀-䶿]+/g;

/**
 * Tokenize mixed Chinese-English text.
 *
 * 处理流程：
 * 1. 先按空白字符拆分（英文单词边界）
 * 2. 在每个片段中，用正则提取连续中文
 * 3. 中文片段送入分词器（Trie + 双向最大匹配）
 * 4. 非中文片段按 camelCase / 下划线拆分
 *
 * Example: "使用Python编程" → ["使用", "Python", "编程"]
 */
export function tokenize(text: string): string[] {
    if (!text || text.trim().length === 0) return [];

    const parts = text.trim().split(/\s+/);
    const result: string[] = [];

    for (const part of parts) {
        if (!part) continue;

        let lastEnd = 0;
        CHINESE_RE.lastIndex = 0;
        let m: RegExpExecArray | null;

        while ((m = CHINESE_RE.exec(part)) !== null) {
            // Non-Chinese before this match
            if (m.index > lastEnd) {
                const nonChinese = part.substring(lastEnd, m.index);
                if (nonChinese.trim()) {
                    result.push(...splitNonChinese(nonChinese));
                }
            }

            // Chinese run → segment via Trie
            if (segmenter) {
                result.push(...segmenter.segment(m[0]));
            } else {
                // Fallback: character-by-character when segmenter not ready
                result.push(...m[0].split(''));
            }

            lastEnd = m.index + m[0].length;
        }

        // Trailing non-Chinese
        if (lastEnd < part.length) {
            const nonChinese = part.substring(lastEnd);
            if (nonChinese.trim()) {
                result.push(...splitNonChinese(nonChinese));
            }
        }
    }

    return result;
}

/**
 * Split non-Chinese text by underscore first, then camelCase boundaries.
 * Example: "getFileName" → ["get", "File", "Name"]
 */
function splitNonChinese(text: string): string[] {
    const byUnderscore = text.split('_').filter(s => s);
    const result: string[] = [];

    for (const segment of byUnderscore) {
        const camelParts = segment
            .split(/([A-Z]+|[A-Z]?[a-z]+)(?=[A-Z]|\b)/)
            .filter(w => w);
        result.push(...camelParts);
    }

    return result;
}
