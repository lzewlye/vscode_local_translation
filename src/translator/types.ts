/** Core type definitions for the bidirectional Chinese-English dictionary. */

/** Morphological form of an English word (plural, past tense, etc.) */
export interface WordForm {
    /** Form type label, e.g. "plural", "past tense", "root" */
    type: string;
    /** Transformed word or combined form array, depending on type */
    change: string | string[];
}

/** A single dictionary lookup result for one word */
export interface WordEntry {
    /** Source word (Chinese or English) */
    word: string;
    /** Translated definition(s) in the target language, \\n-separated */
    definition: string;
    /** Morphological forms — only populated in en→zh path */
    forms?: WordForm[];
}

/** Top-level translation result for the entire input text */
export interface Translation {
    /** Original input text */
    original: string;
    /** Aggregated / best-match translation */
    definition: string;
    /** Per-word breakdown */
    entries: WordEntry[];
    /** 是否因超出 maxWords 限制被截断 */
    truncated?: boolean;
    /** 被跳过的词/标识符数量 */
    skippedCount?: number;
}
