/**
 * General utility functions.
 */

/** Extract the file name from a full path.
 * Example: "/a/b/c/甲.java" → "甲.java" */
export function getFileName(fullPath: string): string {
    const parts = fullPath.split("/");
    return parts.length > 1 ? parts[parts.length - 1] : fullPath;
}

// ==================== Variable Name Formatting ====================

/** 小驼峰：首词小写，后续词首字母大写 → getUserName */
export function toCamelCase(words: string[]): string {
    if (words.length === 0) return '';
    return words
        .map((w, i) => i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

/** 大驼峰：每个词首字母大写 → GetUserName */
export function toPascalCase(words: string[]): string {
    if (words.length === 0) return '';
    return words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

/** 下划线：全小写，下划线分隔 → get_user_name */
export function toSnakeCase(words: string[]): string {
    if (words.length === 0) return '';
    return words.map(w => w.toLowerCase()).join('_');
}

/** 根据命名风格格式化单词数组 */
export function formatVariableName(words: string[], style: string): string {
    switch (style) {
        case 'PascalCase': return toPascalCase(words);
        case 'snake_case': return toSnakeCase(words);
        case 'camelCase':
        default:
            return toCamelCase(words);
    }
}
