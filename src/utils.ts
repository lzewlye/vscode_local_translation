/**
 * Extract the file name from a full path.
 * Example: "/a/b/c/甲.java" → "甲.java"
 */
export function getFileName(fullPath: string): string {
    const parts = fullPath.split("/");
    return parts.length > 1 ? parts[parts.length - 1] : fullPath;
}
