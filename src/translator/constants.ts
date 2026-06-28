/**
 * Shared constants for en→zh definition processing.
 *
 * CC-CEDICT (zh→en path) does not use POS tags — these apply to ECDICT only.
 */

/** 最大可翻译词数默认值，实际以用户配置 localTranslation.maxWords 为准 */
export const MAX_WORDS_DEFAULT = 20;

/** Preferred POS tag: computer / IT domain */
export const POS_COMPUTER = "[计]";

/** Part-of-speech tags used in adjective+noun pairing logic */
export const POS_NOUN = "n.";
export const POS_ADJ = "a.";
export const POS_ADV = "adv.";
export const POS_VT = "vt.";

/** Literal separator between definition lines in dictionary shards */
export const DEF_SEPARATOR = "\\n";

/**
 * Complete set of ECDICT POS / domain tags.
 * Used to distinguish tagged lines from plain definition text.
 */
export const POS_TAGS: Set<string> = new Set([
    "[计]", "[j]", "[pl.]", "[专利]", "[临床]",
    "[化]", "[化学]", "[化工]", "[医]", "[数]", "[物]", "[生]",
    "[电]", "[电子]", "[机]", "[建]", "[法]", "[经]", "[金融]",
    "[网络]", "[通信]", "[军]", "[航空]", "[船]", "[铁路]",
    "[美]", "[英]", "[口语]", "[俚语]", "[古语]", "[废语]",
    "n.", "na.", "v.", "vt.", "vi.", "vbl.",
    "a.", "adj.", "adv.", "abbr.", "art.",
    "prep.", "pron.", "conj.", "interj.", "int.",
    "num.", "pref.", "suf.", "suff.", "comb.", "phr.",
    "pl.", "un.", "aux.", "col.", "exclam.", "ind.", "ing.",
    "pers.", "ph.", "pla.", "pn.", "pp.", "pr.", "quant.", "st.", "stuff.",
]);
